# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""
ArtDisputeRegistry — Intelligent Contract for adjudicating NFT / art-IP disputes.

Flow: file_claim(defendant, …) -> intake screen (web + vision LLM) -> SERVED or REJECTED.
SERVED cases accept respond() ONLY from the named defendant wallet. Once they
respond (or the response deadline passes), adjudicate() weighs both sides and
records a verdict.

GenLayer features used:
  - gl.nondet.web.render(mode='screenshot')  -> fetch live evidence images
  - gl.nondet.exec_prompt(images=...)        -> multimodal LLM reasoning
  - gl.vm.run_nondet_unsafe                  -> validator consensus on verdicts
"""
from genlayer import *
from dataclasses import dataclass
from datetime import datetime, timezone
import json


STATUS_REJECTED  = 0
STATUS_SERVED    = 1
STATUS_RESPONDED = 2
STATUS_RESOLVED  = 3

VERDICT_NONE          = 0
VERDICT_FOR_PLAINTIFF = 1
VERDICT_FOR_DEFENDANT = 2


@allow_storage
@dataclass
class Case:
    plaintiff: Address
    defendant: Address
    original_art_url: str
    collection_url: str
    plaintiff_argument: str
    defendant_evidence_url: str
    defendant_argument: str
    status: u256
    verdict: u256
    intake_reasoning: str
    service_template: str
    final_reasoning: str
    created_at: u256
    response_deadline: u256


class ArtDisputeRegistry(gl.Contract):
    cases: TreeMap[u256, Case]
    next_case_id: u256
    response_window_seconds: u256

    def __init__(self, response_window_seconds: int = 259200):
        self.response_window_seconds = u256(response_window_seconds)

    @gl.public.view
    def get_case_count(self) -> u256:
        return self.next_case_id

    @gl.public.view
    def get_case(self, case_id: u256) -> str:
        if case_id >= self.next_case_id:
            raise gl.vm.UserError("No such case")
        c = self.cases[case_id]
        return json.dumps({
            "id": int(case_id),
            "plaintiff": c.plaintiff.as_hex,
            "defendant": c.defendant.as_hex,
            "original_art_url": c.original_art_url,
            "collection_url": c.collection_url,
            "plaintiff_argument": c.plaintiff_argument,
            "defendant_evidence_url": c.defendant_evidence_url,
            "defendant_argument": c.defendant_argument,
            "status": int(c.status),
            "verdict": int(c.verdict),
            "intake_reasoning": c.intake_reasoning,
            "service_template": c.service_template,
            "final_reasoning": c.final_reasoning,
            "created_at": int(c.created_at),
            "response_deadline": int(c.response_deadline),
        })

    @gl.public.view
    def list_cases(self) -> str:
        out = []
        i = u256(0)
        while i < self.next_case_id:
            c = self.cases[i]
            out.append({
                "id": int(i),
                "plaintiff": c.plaintiff.as_hex,
                "defendant": c.defendant.as_hex,
                "status": int(c.status),
                "verdict": int(c.verdict),
            })
            i = i + u256(1)
        return json.dumps(out)

    @gl.public.write
    def file_claim(
        self,
        defendant: Address,
        original_art_url: str,
        collection_url: str,
        plaintiff_argument: str,
    ) -> None:
        if isinstance(defendant, int):
            defendant = Address(defendant.to_bytes(20, 'big'))

        if not original_art_url or not collection_url:
            raise gl.vm.UserError("Both artwork and collection URLs are required")
        if defendant == Address(bytes(20)):
            raise gl.vm.UserError("Defendant address is required")
        if defendant == gl.message.sender_address:
            raise gl.vm.UserError("Plaintiff and defendant must be different addresses")

        passed, reasoning = self._screen_intake(
            original_art_url, collection_url, plaintiff_argument
        )

        case_id = self.next_case_id
        c = self.cases.get_or_insert_default(case_id)
        c.plaintiff = gl.message.sender_address
        c.defendant = defendant
        c.original_art_url = original_art_url
        c.collection_url = collection_url
        c.plaintiff_argument = plaintiff_argument
        c.intake_reasoning = reasoning
        c.created_at = u256(int(datetime.now(timezone.utc).timestamp()))

        if passed:
            c.status = u256(STATUS_SERVED)
            c.response_deadline = c.created_at + self.response_window_seconds
            c.service_template = self._build_service_template(
                case_id, defendant, original_art_url, collection_url, plaintiff_argument
            )
        else:
            c.status = u256(STATUS_REJECTED)

        self.next_case_id = case_id + u256(1)

    @gl.public.write
    def respond(
        self,
        case_id: u256,
        defendant_evidence_url: str,
        defendant_argument: str,
    ) -> None:
        if case_id >= self.next_case_id:
            raise gl.vm.UserError("No such case")
        c = self.cases[case_id]
        if int(c.status) != STATUS_SERVED:
            raise gl.vm.UserError("Case is not open for response")
        if gl.message.sender_address != c.defendant:
            raise gl.vm.UserError("Only the named defendant may respond to this case")
        if not defendant_evidence_url:
            raise gl.vm.UserError("Defendant evidence URL is required")
        c.defendant_evidence_url = defendant_evidence_url
        c.defendant_argument = defendant_argument
        c.status = u256(STATUS_RESPONDED)

    @gl.public.write
    def adjudicate(self, case_id: u256) -> None:
        if case_id >= self.next_case_id:
            raise gl.vm.UserError("No such case")
        c = self.cases[case_id]
        if int(c.status) == STATUS_RESOLVED:
            raise gl.vm.UserError("Case already resolved")

        now = u256(int(datetime.now(timezone.utc).timestamp()))
        by_default = False
        if int(c.status) == STATUS_SERVED:
            if now < c.response_deadline:
                raise gl.vm.UserError("Defendant still has time to respond")
            by_default = True
        elif int(c.status) != STATUS_RESPONDED:
            raise gl.vm.UserError("Case is not ready for adjudication")

        verdict_code, reasoning = self._weigh_case(c, by_default)
        c.verdict = u256(verdict_code)
        c.final_reasoning = reasoning
        c.status = u256(STATUS_RESOLVED)

    def _screen_intake(
        self, original_art_url: str, collection_url: str, argument: str
    ) -> tuple[bool, str]:
        def leader_fn():
            orig_img = gl.nondet.web.render(original_art_url, mode='screenshot')
            coll_img = gl.nondet.web.render(collection_url, mode='screenshot')
            prompt = f"""You are an intake officer for an art-IP dispute registry.
A plaintiff claims the artwork in IMAGE 1 (their original) was copied or used
without permission in the collection shown in IMAGE 2.

Plaintiff's argument: {argument}

Your ONLY job at intake is to decide whether this is a PLAUSIBLE, non-frivolous
claim worth formally serving on the other party — NOT to decide who wins.
Reject only if the claim is clearly frivolous, incoherent, the images are
unrelated in a way that makes infringement impossible, or there is no
discernible similarity whatsoever.

Respond ONLY as JSON:
{{"plausible": true/false, "reason": "<one or two sentence explanation>"}}"""
            return gl.nondet.exec_prompt(
                prompt, images=[orig_img, coll_img], response_format="json"
            )

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            mine = leader_fn()
            return bool(mine["plausible"]) == bool(leaders_res.calldata["plausible"])

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        return bool(result["plausible"]), str(result.get("reason", ""))

    def _weigh_case(self, c: Case, by_default: bool) -> tuple[int, str]:
        orig_url = c.original_art_url
        coll_url = c.collection_url
        def_url  = c.defendant_evidence_url
        p_arg    = c.plaintiff_argument
        d_arg    = c.defendant_argument if not by_default else "(no response submitted)"
        defaulted = by_default

        def leader_fn():
            images = [
                gl.nondet.web.render(orig_url, mode='screenshot'),
                gl.nondet.web.render(coll_url, mode='screenshot'),
            ]
            if def_url:
                images.append(gl.nondet.web.render(def_url, mode='screenshot'))

            default_note = (
                "NOTE: The defendant did not respond before the deadline. "
                "Judge on the plaintiff's evidence alone, but do not rule for the "
                "plaintiff automatically — the claim must still stand on its merits.\n"
                if defaulted else ""
            )
            third_label = "IMAGE 3 = the defendant's supporting evidence." if def_url else ""

            prompt = f"""You are an impartial adjudicator resolving an art-IP dispute.

IMAGE 1 = plaintiff's original artwork.
IMAGE 2 = the allegedly infringing collection.
{third_label}

{default_note}Plaintiff's argument: {p_arg}
Defendant's argument: {d_arg}

Weigh visual similarity, originality, the possibility of independent creation or
coincidental similarity, and the strength of each side's argument. Decide who
should prevail.

Respond ONLY as JSON:
{{"winner": "plaintiff" | "defendant", "reason": "<2-4 sentence explanation>"}}"""
            return gl.nondet.exec_prompt(
                prompt, images=images, response_format="json"
            )

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            mine = leader_fn()
            return (
                str(mine["winner"]).lower()
                == str(leaders_res.calldata["winner"]).lower()
            )

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        winner = str(result.get("winner", "")).lower()
        reasoning = str(result.get("reason", ""))
        if winner == "plaintiff":
            return VERDICT_FOR_PLAINTIFF, reasoning
        if winner == "defendant":
            return VERDICT_FOR_DEFENDANT, reasoning
        return VERDICT_FOR_DEFENDANT, reasoning or "Inconclusive; burden of proof rests on the plaintiff."

    def _build_service_template(
        self,
        case_id: u256,
        defendant: Address,
        original_art_url: str,
        collection_url: str,
        argument: str,
    ) -> str:
        return (
            f"NOTICE OF ART-IP DISPUTE — Case #{int(case_id)}\n\n"
            f"To: {defendant.as_hex}\n\n"
            f"You are hereby notified that a claim has been filed alleging that the "
            f"collection at {collection_url} infringes original artwork located at "
            f"{original_art_url}.\n\n"
            f"Summary of claim: {argument}\n\n"
            f"Only the wallet address above may respond. To defend, call "
            f"`respond({int(case_id)}, <your_evidence_url>, <your_argument>)` on this "
            f"contract from that wallet before the response deadline. If you do not "
            f"respond, the case may be adjudicated by default."
        )
