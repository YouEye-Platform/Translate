# Timeline collection

All activity producers must use `api.postTimelineEntry`, which delegates to the
shared local `postAdmittedTimeline` helper. Each emitter captures the action
timestamp before awaiting locale or other metadata, carries it unchanged in the
payload, and preserves an earlier supplied timestamp. The helper uses that
timestamp before reading the signed-in account’s fresh collection preference.
Off, missing, unknown, denied or pre-interval state sends no payload. Enabled
events carry the exact `collection_revision` returned by the platform.

Do not cache consent, persist pending Timeline payloads, or retry rejected events
after re-enable. Preserve original event times. App-owned records are separate
from optional Timeline collection. The platform independently enforces permission,
account admission and collection at commit; a producer precheck is not authority.

`tests/timeline-consent.spec.mjs` covers denied/off/unknown/old-interval behavior
and exact-revision submission without retry. Installed journeys and update or
recovery compatibility require separate runtime acceptance.
