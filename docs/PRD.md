# PRD: Retiree Re-integration — GOSI Opportunities (V4)

> Source of truth for product behaviour. The demo build spec (DEMO-SPEC.md) adds demo-only mechanics on top; where they differ, DEMO-SPEC.md wins for the demo.


# Product Concept

| Field       | Detail                                                                                                                                                        |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Name        | GOSI Opportunities / فرص التأمينات الاجتماعية                                                                                         |
| One-liner   | A national marketplace inside the GOSI app where verified retirees share professional experience with individuals seeking trusted guidance.                   |
| Platform    | A dedicated entry point within the GOSI super-app. Uses Nafath for identity and GOSI records for retirement verification.                                     |
| Supply side | GOSI-verified retirees, including a significant early-retiree segment. Onboarded in controlled waves by invitation.                                           |
| Demand side | Any GOSI app user aged 18 or over. No additional verification, no separate onboarding. Saudis and residents alike.                                            |
| MVP 1 model | Free sessions as standard. Paid sessions are built into MVP 1 behind one configuration switch, off at launch and turned on only if top management decides to. |
| Owner       | Business owner team, who also operate the review and moderation function.                                                                                     |


# MVP Scope

What MVP 1 covers, and what it deliberately does not.

## 1. Retirees in scope

All GOSI retirees are eligible, regardless of the system their pension comes from.

| Retiree type                                       | In scope                     |
|----------------------------------------------------|------------------------------|
| Public sector pension retirees                     | Yes |
| Private sector pension retirees                    | Yes |
| Retirees with a combined public and private record | Yes |

Retirement type is not an eligibility factor. What determines eligibility is the profession, below.

## 2. Professions in scope

MVP 1 opens to two professions only.

| Profession  | Who qualifies                                                 |
|-------------|---------------------------------------------------------------|
| Teachers    | Retirees who worked in teaching roles in the education sector |
| Accountants | Retirees who worked in accounting roles                       |

### How a retiree is qualified:

| Basis                       | Detail                                                                                                                                          |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| GOSI employment record      | Employer, dates, duration, and sector, read from GOSI records. The primary basis for qualification.                                             |
| Declared role and documents | The retiree states their professional role and may upload certificates and a CV.                                                                |
| Operator validation         | An operator reviews the GOSI record together with the declared role and uploaded documents, and approves or does not approve each Service Type. |

The operator validates that documents are relevant and consistent with the record. GOSI does not authenticate certificates with their issuing bodies.

## 3. Services provided

| Profession  | Service Types                                                                                                                                                           |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Teachers    | English language lessons and conversation practice · Arabic language lessons for non-Arabic speakers · Other language lessons (e.g. French) · Language exam preparation |
| Accountants | Understanding small business accounts · Guidance on setting up bookkeeping · Understanding financial statements · Understanding VAT and Zakat obligations               |

All services are guidance and knowledge-sharing based on professional experience. No service involves a licensed professional opinion, certification, or signed deliverable, so no service requires a practising license. For example, a retired English teacher offers conversation practice rather than issuing a certified language qualification or grading an official exam.

## 4. Engagement model

| Element                                | MVP 1                                                                                                                                                                              |
|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Format                                 | One-hour session, delivered as a video call inside the GOSI app                                                                                                                    |
| Booking                                | Each session booked individually, from the retiree's available slots                                                                                                               |
| Repeat sessions                        | Allowed. A seeker can rebook the same retiree as often as needed, each booking separate.                                                                                           |
| Multi-hour or agreed-scope engagements | Not in MVP 1. Considered for a later phase.                                                                                                                                        |
| Offline work and deliverables          | Out of scope. All services, including accounting, are delivered as live sessions.                                                                                                  |
| Nature of participation                | Knowledge-sharing between individuals, free or, when the paid switch is on, paid. Not formal volunteering. GOSI doesn't assign tasks, set hours, or manage retirees as volunteers. |

## 5. GOSI's role

GOSI acts as platform operator.

| GOSI is responsible for                                                                                                | GOSI is not responsible for                                        |
|------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| Confirming retirement status and employment history from its records                                                   | The accuracy or outcome of guidance given in a session             |
| Reviewing and approving each retiree's application and Service Types                                                   | Verifying current professional competence or licensure             |
| Hosting the session securely inside the GOSI app                                                                       | Any arrangement made between parties outside the platform          |
| Protecting the personal data of both parties                                                                           | Authenticating uploaded certificates with issuing bodies           |
| Handling complaints and disputes, and pausing retirees where needed                                                    | The value a seeker places on a session, beyond the dispute process |
| When the paid switch is on: collecting, holding, refunding, and settling payments through its payment service provider |                                                                    |


A disclaimer is shown to both parties at booking stating that sessions are guidance based on professional experience, not a licensed professional service.


## 6. Free and paid

| Element          | MVP 1                                                                                         |
|------------------|-----------------------------------------------------------------------------------------------|
| Default          | All sessions free                                                                             |
| Paid sessions    | Built into MVP 1, behind one global configuration switch                                      |
| Switch at launch | Off. Turned on only if top management decides to.                                             |
| When on          | Any approved retiree can opt in, and choose free or paid for each Service Type                |
| GOSI fee         | None. GOSI absorbs payment processing costs, and the retiree receives the full session price. |

Full detail is under Paid Sessions below.

## 7. Retiree value in MVP 1

Whether or not paid sessions are switched on, the MVP offers retirees value beyond income:

| Value                  | Detail                                                                                                        |
|------------------------|---------------------------------------------------------------------------------------------------------------|
| Early-member advantage | MVP retirees build their ratings and reviews first, so they're the established profiles as the platform grows |
| Recognition            | A verified profile, and acknowledgement from GOSI for active contributors                                     |
| Purpose                | Staying professionally active and passing on their experience                                                 |

# Problem

**Supply side (documented).** 600K+ pensioners hold an idle base of professional experience. 434,220 are early retirees who left full-time work before statutory retirement age, and 62% of surveyed retirees are actively seeking additional income. Retirement is a binary switch-off, with no structured channel to transfer or monetize that experience and no way to build a reputation independent of a former employer.

**Demand side (asserted, not yet evidenced).** Individuals need senior specialist input but find formal consultancies costly and slow, informal referral networks hard to trust, and short-notice access difficult. No figure yet quantifies this need. A demand-side survey has been prepared, and its results will inform the launch.

# Opportunity

GOSI can confirm, from its own records, that a person is genuinely retired and where they worked and for how long. No commercial marketplace can do that. It is a narrow claim but a real one, and it is the only structural advantage this product has over a generic expert platform.

The claim must stay narrow. GOSI verifies identity, retirement status, and employment history. It does not verify competence, current professional standing, or the quality of advice given. Every seeker-facing statement in the product must reflect that distinction.

# How It Works

A retiree is invited to apply. Their identity is already established through Nafath at app login, and their retirement status and employment history are read from GOSI records. They add their own account of their professional background and any supporting documents, then select Service Types from a fixed GOSI taxonomy. An operator from the business owner team reviews the application, Service Type by Service Type, and approves it or returns it with a reason.

Once approved, the retiree sets their availability. Any GOSI app user browses the marketplace, sees what a retiree offers and what GOSI has verified about them, and books a one-hour session. The session runs as a video call inside the app. Afterwards the seeker rates it and answers whether it helped.

Sessions are free by default. Paid sessions are built in behind one configuration switch. If top management turns it on, retirees can price individual Service Types within a GOSI price band, seekers pay at booking, and GOSI's payment service provider holds the money until 48 hours after the session. It is then settled to the retiree monthly, alongside their pension. Ratings, feedback, and reliability data accumulate against each retiree and are reviewed by the operations team.

# The Journey

## Stage 1: Invitation and application

A retiree cannot sign up on their own in MVP 1. The business owner team selects who gets access and sends invitations in controlled batches, so that supply growth stays matched to observed demand and review load stays within ops capacity.

### How a wave is created and sent:

| Step                   | Detail                                                                                                                                                                  |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1\. Build the cohort   | An operator uses the admin panel to filter GOSI's retiree base by criteria such as pension type, sector, years of contribution, and region, producing a candidate list. |
| 2\. Set wave size      | The operator caps the wave at a number the review team can process within the turnaround target. Wave size is a manual input, not automatic.                            |
| 3\. Review and confirm | The operator sees the resulting cohort count and a breakdown by sector before confirming. Candidates already invited or already active are excluded automatically.      |
| 4\. Send               | Invitations are issued as in-app notifications to the selected retirees. The GOSI Opportunities card becomes visible and actionable for them.                           |
| 5\. Track              | The panel shows, per wave, how many were invited, opened, started an application, submitted, were approved, and delivered a first session.                              |

### Rules governing invitations:

| Rule                         | Detail                                                                                                                                                                                              |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Visibility before invitation | An uninvited retiree does not see the GOSI Opportunities entry point at all                                                                                                                         |
| Expiry                       | An invitation does not expire in MVP 1. A retiree may apply whenever they choose.                                                                                                                   |
| Manual addition              | An operator can invite a named individual outside a wave, for example a retiree who contacted the business owner team directly. The identifier used to add a retiree manually is their National ID. |
| Audit                        | Every wave and manual invitation is logged with the operator, timestamp, etc.                                                                                                                       |

Wave performance informs the next wave's size and targeting. If a cohort converts poorly from invitation to first session, the cause is either targeting or onboarding friction, and both are visible in the funnel above before more invitations go out.

### Application entry:

| Element              | Detail                                                                                                                             |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Entry point          | GOSI Opportunities card in the super-app, visible to invited retirees                                                              |
| Eligibility to apply | Confirmed retiree in GOSI records, and invited                                                                                     |
| Application state    | Draft until submitted. The retiree can save and return at any time.                                                                |
| Terms and conditions | Presented and agreed on when the retiree submits the application for review. The application can't be submitted without agreement. |

## Stage 2: Eligibility confirmation

No verification step. Identity is already established: a user reaching the GOSI super-app has authenticated through Nafath, and GOSI's records identify them once landing on the main page. The platform reads what it already knows.

| Attribute          | Source                           | Use                                                                               |
|--------------------|----------------------------------|-----------------------------------------------------------------------------------|
| Identity           | Nafath, established at app login | Name for the profile. No re-verification.                                         |
| Retiree status     | GOSI pension record              | Confirmed retiree or not. Public, private, and combined records are all eligible. |
| Employment history | GOSI contribution record         | Employers, dates, duration, sector classification                                 |

## Stage 3: Profile construction

The profile carries two data layers, and they must be visually distinct to the seeker.

**First Data Layer 1: GOSI verified data.** Drawn from Stage 2, read-only. The retiree chooses which optional fields to display, and mandatory ones are always shown on their profile.

| Field                            | Display                                            |
|----------------------------------|----------------------------------------------------|
| Name                             | Always displayed                                   |
| Retirement status                | Always displayed as confirmed retiree              |
| Years of professional experience | Always displayed, from total contribution duration |
| Year last active                 | Always displayed, not optional                     |
| Employers and dates              | Retiree's choice                                   |
| Sector                           | Retiree's choice                                   |

**Second Data Layer 2: Retiree declared data.** The retiree's own provided data, not verified by GOSI, labelled as self-declared wherever it appears.

| Field                            | Input type                   | Mandatory | Moderated |
|----------------------------------|------------------------------|-----------|-----------|
| Professional discipline and role | Free text                    | Yes       | Yes       |
| Specializations                  | Free text, multi-line        | No        | Yes       |
| Certificates and qualifications  | File upload, multiple        | No        | Yes       |
| CV or professional summary       | File upload                  | No        | Yes       |
| Languages offered                | Multi-select from fixed list | Yes       | No        |
| Personal introduction            | Free text, multi-line        | No        | Yes       |

## Stage 4: Category and Service Type selection

The retiree selects from the fixed taxonomy. No free text in the classification itself, only in the description of their own offering within it.

| Rule                   | Detail                                                                                                                                               | Example                                                                                                                                                                                                              |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Structure              | Two fixed levels, both maintained by GOSI. Category is the broad professional field. Service Type is the specific thing offered within it.           | Category: Education and Training → Service Type: English language lessons and conversation practice                                                                                                                  |
| Retiree action         | Select a Category, then a Service Type from that Category's list, then write a short description of what they personally offer within it             | Selects the above, then writes: "I taught English in secondary schools for 24 years. I can help you practice conversation, work on pronunciation, or prepare for an interview or presentation in English."           |
| Multiple Service Types | Permitted, with no cap. Each Category and Service Type combination is reviewed and approved separately.                                              | A retired English teacher may hold Education and Training → English language lessons and conversation practice, and Education and Training → Language exam preparation, as two separately approved listings.         |
| Adding later           | Adding a new Service Type after initial approval requires a new review before it goes live. Existing approved listings stay live during that review. | Approved for the two listings above, the retiree later adds Education and Training → Other language lessons (e.g. French). That third listing is held for review while the first two continue taking bookings.       |
| Description            | Free text written by the retiree, moderated before publication. Describes their own experience within the chosen Service Type.                       | "I taught English at secondary level for 24 years, including exam preparation. Sessions are conversational and I adapt to your level, whether you want everyday fluency or help preparing for a specific situation." |

The retiree never types a Category or Service Type name. Both are always selected from GOSI's fixed lists. The only free text is the description of what they personally bring to that Service Type.

# Category and Service Type

MVP 1 launches with two Categories: Education, delivered by retired teachers, and Accounting, delivered by retired accountants.



Education and Trainingالتعليم والتدريب



Retired teachers deliver remote teaching through the GOSI app to users and residents who want to learn a specific language.

| Service Type                                       | نوع الخدمة                             |
|----------------------------------------------------|----------------------------------------|
| English language lessons and conversation practice | دروس اللغة الإنجليزية وممارسة المحادثة |
| Arabic language lessons for non-Arabic speakers    | دروس اللغة العربية لغير الناطقين بها   |
| Other language lessons (e.g. French)               | دروس لغات أخرى (مثل الفرنسية)          |
| Language exam preparation                          | الاستعداد لاختبارات اللغة              |


**Example:** a resident who wants to learn Arabic books weekly one-hour sessions with a retired Arabic teacher, from home, through the app.






Accounting and Financeالمحاسبة والمالية



Retired accountants share accounting guidance with users who need it. Sessions are guidance only, with no review, filing, or deliverable on the seeker's behalf.

| Service Type                            | نوع الخدمة                                |
|-----------------------------------------|-------------------------------------------|
| Understanding small business accounts   | فهم حسابات المنشآت الصغيرة                |
| Guidance on setting up bookkeeping      | إرشادات إعداد الحسابات ومسك الدفاتر       |
| Understanding financial statements      | فهم القوائم المالية وقراءتها              |
| Understanding VAT and Zakat obligations | فهم التزامات ضريبة القيمة المضافة والزكاة |


**Example:** a restaurant owner books a session with a retired accountant to understand how to organise the restaurant's accounts and what its VAT obligations are.




## Stage 5: Review and approval

Each application is reviewed and assessed by an operator rather than approved automatically, because the sector field from GOSI records alone is not a reliable basis for deciding what a retiree is qualified to offer.

For each Service Type the reviewer weighs three things together:

1.  Layer 1: Employment history from GOSI records, including the sector the retiree comes from.
2.  Layer 2: The retiree's professional discipline and role, specializations, certificates and qualifications, and CV or professional summary.
3.  Whether the written description matches the selected Service Type.

Employment history informs the decision but does not determine it. A retiree whose GOSI sector reads construction may be approved for an Accounting and Finance Service Type if their declared role and documents show they worked as an accountant.

**Outcomes:** Approved, or not approved with a reason. The reason is shown to the retiree, who may amend and resubmit. There is no permanent block at application stage.

*Review outcomes: Application submitted → Operator review → Approved (listing goes live) or Not approved (reason code shown → amend and resubmit → back to Operator review). No permanent block at application stage.*

## Stage 6: Going live

| Element                      | Detail                                                                                                                                                                                                |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Availability                 | Retiree-defined. They set the windows in which they can be booked.                                                                                                                                    |
| Session duration             | Fixed at 1 hour for all sessions in MVP 1                                                                                                                                                             |
| Volume                       | No cap on the number of sessions a retiree may deliver                                                                                                                                                |
| Free or paid \[Paid switch\] | For each approved Service Type, the retiree chooses free or paid. If paid, they set a price within the GOSI band, guided by the suggested price for the Category. Changes apply to new bookings only. |
| Concurrency                  | A retiree cannot hold two bookings for the same time                                                                                                                                                  |
| Pausing                      | Retiree can stop taking new bookings at any time, self-service. Confirmed bookings stay in place.                                                                                                     |
| Readiness test call          | Before going live, the retiree completes a short test call to confirm camera, microphone, and connection work                                                                                         |
| Onboarding video guide       | A short in-app video, recorded by the QA team, walking retirees through how to run a session                                                                                                          |

## Stage 7: Seeker discovery and booking

Any authenticated user of the GOSI super-app aged 18 or over can enter through the GOSI Opportunities card. Age is checked automatically from the GOSI app account.

<table data-keep="">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th style="width: 24%">Element</th>
<th>Detail</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Browse</td>
<td>By Category, then by Service Type within it</td>
</tr>
<tr class="even">
<td>Retiree profile</td>
<td>• GOSI-verified data: name, confirmed retiree status, years of professional experience, year last active, and any employers, dates, or sector the retiree has chosen to display. 
 
• Retiree-declared data, clearly labelled as self-declared: professional discipline and role, specializations, certificates and qualifications, CV, languages offered, and personal introduction. Plus aggregate rating, number of sessions delivered, and written reviews from previous seekers.</td>
</tr>
<tr class="odd">
<td>New retiree with no history</td>
<td>Shown as new to the platform rather than a blank or zero rating, so a newly approved retiree remains bookable</td>
</tr>
<tr class="even">
<td>Fully booked retiree</td>
<td>Stays visible with their next available slot shown, rather than being hidden, so seekers can see supply exists. A booked slot can't be double-booked.</td>
</tr>
<tr class="odd">
<td>Gender preference</td>
<td>Not supported in MVP 1. Every retiree is available to every seeker, to maximise the chance of a match while supply is small.</td>
</tr>
<tr class="even">
<td>Booking</td>
<td>Seeker selects an available slot. Confirmation is immediate, no retiree acceptance step.</td>
</tr>
<tr class="odd">
<td>Booking window</td>
<td>At least 24 hours ahead, up to 30 days ahead. The 24-hour minimum lowers the chance of no-shows and gives retirees time to prepare.</td>
</tr>
<tr class="even">
<td>Pre-session input</td>
<td>Seeker provides notes on what they need and what they want out of the session. Required.</td>
</tr>
<tr class="odd">
<td>Terms and conditions</td>
<td>Presented and agreed on when confirming a booking, including payment, refund, and dispute terms for paid sessions. No booking can be confirmed without agreement.</td>
</tr>
<tr class="even">
<td>Cost</td>
<td>Free, or the retiree's price for that Service Type when the paid switch is on. Shown on the profile, on each slot, and before payment.</td>
</tr>
<tr class="odd">
<td>Payment [Paid switch]</td>
<td>Paid in the app when confirming the booking. The booking is confirmed only once payment succeeds. The slot is held for 10 minutes while the seeker pays.</td>
</tr>
</tbody>
</table>


What the retiree sees before the session: the seeker's first name, their notes, and their stated intent.


## Stage 8: Session delivery

Video call inside the GOSI app.


Some of these technical components may be reused from Wafrah video call sessions.


| Element            | Behaviour                                                                                                                                                               |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Scheduled duration | 1 hour, shown to both parties                                                                                                                                           |
| At 60 minutes      | Both parties are notified that scheduled time has ended. The call continues.                                                                                            |
| Overrun            | Permitted, not limited. If the retiree has a following booking, the 60-minute notice says so.                                                                           |
| Leaving            | Either party may leave at any time. Leaving does not end the session for the other party.                                                                               |
| Session end        | When both parties have left after the call duration has passed.                                                                                                         |
| Sharing documents  | Screen sharing only. Either party can show a document on screen, but no files are transferred or stored, which keeps sensitive documents off GOSI's systems in the MVP. |

### Cancellation:

Either party can cancel a booking up to 3 hours before the session. The other party is notified in app straight away.

| Case                                            | Rule                                       | Notification                                               |
|-------------------------------------------------|--------------------------------------------|------------------------------------------------------------|
| Seeker cancels 3 hours or more before           | Free, no record                            | Retiree notified in app that the booking was cancelled     |
| Seeker cancels within 3 hours                   | Recorded against the seeker                | Retiree notified in app that the booking was cancelled     |
| Retiree cancels 3 hours or more before          | Free, no record                            | Seeker notified in app, with a prompt to book another slot |
| Retiree cancels within 3 hours                  | Recorded against the retiree               | Seeker notified in app, with a prompt to book another slot |
| Retiree paused by GOSI with a confirmed booking | Booking cancelled automatically            | Seeker notified in app, with a prompt to rebook            |
| Rescheduling                                    | Not supported in MVP 1. Cancel and rebook. | —                                                          |


**Paid sessions:** every cancellation, by either party and at any time, is refunded to the seeker in full. The records above still apply. See Paid Sessions.


## Stage 9: Post-session feedback

Collected from the seeker, optional except where noted.

| Input            | Format                                                                                                                            | Purpose                                                                         |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| Rating           | 1 to 5                                                                                                                            | Overall satisfaction                                                            |
| Outcome question | "Did this session help with what you needed?" Yes or no.                                                                          | Usefulness independent of manner. Higher response rate than free text.          |
| Structured tags  | Fixed list: clear explanation, strong knowledge, well prepared, unclear, limited knowledge, unprepared, off-topic, unprofessional | Turns a low score into an actionable reason with no free-text moderation burden |
| Written review   | Optional free text                                                                                                                | Moderated before display                                                        |
| Report a problem | Any time. On a paid session, a report raised within 48 hours of the session opens a dispute and holds the payout.                 | Routes to ops                                                                   |


**What the retiree sees:** their aggregate rating only. Individual session ratings, reviews, and who gave what are not shown.


## Stage 10: Ongoing monitoring

One screen in the ops console listing every active retiree. An operator reviews it periodically and acts where something looks wrong.

### What the operator sees per retiree:

| Field                    | Detail                                                                                           |
|--------------------------|--------------------------------------------------------------------------------------------------|
| Retiree name             | From GOSI records                                                                                |
| Retiree mobile number    | Where available                                                                                  |
| Status in the program    | Active or Paused                                                                                 |
| Approved Service Types   | All Service Types the retiree is approved for                                                    |
| Date approved            | When the retiree was first approved                                                              |
| Sessions delivered       | Total count delivered by the retiree                                                             |
| Aggregate rating         | The retiree's average rating, or none yet                                                        |
| Missed sessions          | Sessions the retiree did not attend                                                              |
| Late cancellations       | Cancellations by the retiree within 3 hours of start                                             |
| Complaints               | Count raised against the retiree by seekers                                                      |
| Disputes \[Paid switch\] | Disputes raised on the retiree's paid sessions, and how many were decided in the seeker's favour |
| Earnings \[Paid switch\] | Amounts held, released, and paid out, as defined under Paid Sessions                             |
| Date of last session     | The retiree's most recent delivered session                                                      |
| History                  | Notes previously sent to the retiree, and any past status changes                                |

### What the operator can do:

| Action                           | Effect                                                                                                                                                                            |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Send a note                      | In-app message to the retiree, from a template                                                                                                                                    |
| Pause                            | Listings hidden, confirmed bookings cancelled, seekers notified. Removal from GOSI Opportunities only; the retiree keeps full access to the GOSI app and all other GOSI services. |
| Restore                          | Returns a paused retiree to Active                                                                                                                                                |
| Decide a dispute \[Paid switch\] | Refund in full, or reject and release the payment. See Paid Sessions.                                                                                                             |

Every action is logged with the operator and timestamp. Every status is reversible; there is no permanent removal in MVP 1.

# Service Category Taxonomy

Two levels: Category, then Service Type. Both fixed and maintained by GOSI. Retirees select; they do not create.

## MVP: launch set

Two categories: Education and Training, and Accounting and Finance, with the Service Types listed under Category and Service Type above. Chosen because the value sits entirely in the conversation and the seeker can tell immediately whether the session helped.

The full list eventually spans 15 categories including Engineering, Finance, Legal, Healthcare, IT, and Government.

# Retiree Account Lifecycle States

| State          | Can deliver?                 | Visible to seekers?          |
|----------------|------------------------------|------------------------------|
| Draft          | No                           | No                           |
| Pending review | No                           | No                           |
| Not approved   | No                           | No                           |
| **Active**     | Yes | Yes |
| Paused         | No                           | No                           |

# Features and MVP Split

## Retiree

| \#  | Feature                                                                                                    | MVP 1 | Later |
|-----|------------------------------------------------------------------------------------------------------------|-------|-------|
| 1   | GOSI retirement and employment record retrieval                                                            | ✓     |       |
| 2   | Retiree-declared profile content: professional discipline and role, specializations, personal introduction | ✓     |       |
| 3   | Certificate and CV upload                                                                                  | ✓     |       |
| 4   | Language declaration                                                                                       | ✓     |       |
| 5   | Category and Service Type selection                                                                        | ✓     |       |
| 6   | Application submission, and amend and resubmit if not approved                                             | ✓     |       |
| 7   | Availability management of schedule                                                                        | ✓     |       |
| 8   | Booking list and session management                                                                        | ✓     |       |
| 9   | Session delivery, video call                                                                               | ✓     |       |
| 10  | Aggregate rating visible to the retiree                                                                    | ✓     |       |
| 11  | In-app notes received from ops: application outcome                                                        | ✓     |       |
| 12  | Self-service pause and return: stop taking new session bookings, then return to Active when ready          | ✓     |       |
| 13  | Readiness test call before going live                                                                      | ✓     |       |
| 14  | In-app onboarding video guide                                                                              | ✓     |       |
| 15  | Cancel a booking up to 3 hours before the session                                                          | ✓     |       |
| 16  | Choose free or paid for each approved Service Type \[Paid switch\]                                         | ✓     |       |
| 17  | Set a price within the GOSI band, with the suggested price shown \[Paid switch\]                           | ✓     |       |
| 18  | Earnings view: amounts held, released, and paid out \[Paid switch\]                                        | ✓     |       |
| 19  | Monthly payout to the bank account GOSI pays the pension to \[Paid switch\]                                | ✓     |       |

## Seeker

| \#  | Feature                                                            | MVP 1 | Later |
|-----|--------------------------------------------------------------------|-------|-------|
| 20  | GOSI Opportunities entry point card                                | ✓     |       |
| 21  | Browse by Category and Service Type                                | ✓     |       |
| 22  | Search and filter, including by language                           | ✓     |       |
| 23  | Retiree profile with verification display                          | ✓     |       |
| 24  | Slot selection and immediate booking                               | ✓     |       |
| 25  | Pre-session notes and intent capture                               | ✓     |       |
| 26  | Join and attend session, with screen sharing                       | ✓     |       |
| 27  | Cancel booking up to 3 hours before the session                    | ✓     |       |
| 28  | Post-session rating and written review                             | ✓     |       |
| 29  | Report a problem                                                   | ✓     |       |
| 30  | Booking history and rebooking                                      | ✓     |       |
| 31  | See price on the profile, slot, and before payment \[Paid switch\] | ✓     |       |
| 32  | Pay for a session in the app at booking \[Paid switch\]            | ✓     |       |
| 33  | Raise a dispute on a paid session within 48 hours \[Paid switch\]  | ✓     |       |
| 34  | Seeker-posted open requests                                        |       | ✓     |

## Operations

| \#  | Feature                                                                                                                                                                                                      | MVP 1 | Later |
|-----|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|-------|
| 35  | Invitation and wave management: build retiree cohorts from GOSI records, send invitations in batches, and invite individuals manually                                                                        | ✓     |       |
| 36  | Application review queue: submitted retiree applications land here for an operator to review, moderate the retiree's written content and uploads, and approve or not approve per Service Type with a reason. | ✓     |       |
| 37  | Retiree monitoring list: all retirees with their session activity, ratings, missed sessions, and complaints, with actions to send a note, pause, or restore a profile.                                       | ✓     |       |
| 38  | Complaint and report handling                                                                                                                                                                                | ✓     |       |
| 39  | Audit log: every operator action recorded with operator and timestamp                                                                                                                                        | ✓     |       |
| 40  | Dispute queue: review the seeker's report, call logs, pre-session notes, and rating, then refund in full or reject \[Paid switch\]                                                                           | ✓     |       |
| 41  | Monthly settlement and reconciliation with the payment service provider \[Paid switch\]                                                                                                                      | ✓     |       |

## Platform

| \#  | Feature                                                                                                                                                | MVP 1 | Later |
|-----|--------------------------------------------------------------------------------------------------------------------------------------------------------|-------|-------|
| 42  | Paid sessions configuration, managed by the tech team: global switch, price floor and ceiling, and suggested price per Category                        | ✓     |       |
| 43  | In-app notifications: booking, reminder, cancellation, approval outcome, ops notes, and, when paid is on, payment, refund, dispute outcome, and payout | ✓     |       |
| 44  | Terms and conditions presented and agreed on at application submission and at booking                                                                  | ✓     |       |
| 45  | Age check (18+) for seekers from the GOSI app account                                                                                                  | ✓     |       |
| 46  | Payment, hold, refund, and release through GOSI's existing payment service provider, under a dedicated merchant ID \[Paid switch\]                     | ✓     |       |

All notifications are in-app. No SMS or email channel in MVP 1.


Features tagged \[Paid switch\] are built in MVP 1 but only visible to users when the paid sessions switch is on.


# Paid Sessions


**Built in MVP 1, behind one switch.** Paid sessions are off at launch and turned on only if top management decides to. While the switch is off, the product behaves as free-only: no prices, payment screens, or earnings views are shown.


## Configuration

All paid-session settings are technical configuration, built and managed by the tech team. None are available in the ops console.

| Setting              | Detail                                                                 | Managed by |
|----------------------|------------------------------------------------------------------------|------------|
| Paid sessions switch | On or off for the whole product, switched on top management's decision | Tech team  |
| Price floor          | Minimum price per session, in SAR                                      | Tech team  |
| Price ceiling        | Maximum price per session, in SAR                                      | Tech team  |
| Suggested price      | One per Category, shown to retirees when they set a price              | Tech team  |

Amounts are decided by management before the switch is turned on, and applied by the tech team. They can be changed later without a release. If the band changes, any price outside it moves to the nearest limit for new bookings, and the retiree is notified.

### Why a price band rather than a free market:

- GOSI's name sits on every profile. A ceiling keeps sessions positioned as guidance rather than a premium professional service, and limits the amount held on any one dispute.
- Because GOSI absorbs payment costs, a floor keeps each session above the point where processing costs outweigh its value.
- Most retirees will be pricing their time for the first time. A suggested price per Category gives them a sensible starting point.

## Who can charge

| Element       | Detail                                                                                            |
|---------------|---------------------------------------------------------------------------------------------------|
| Eligibility   | Any approved retiree can opt in. No extra threshold.                                              |
| Level         | Free or paid is set per Service Type. A retiree can offer one Service Type free and another paid. |
| Price changes | Apply to new bookings only. Confirmed bookings keep the price paid.                               |
| GOSI fee      | None. The retiree receives the full price.                                                        |

## How the money moves

| \#  | Step                | What happens                                                                                                                                                                                                              |
|-----|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1   | Seeker pays         | In the app, when confirming the booking. The booking is confirmed only once payment succeeds.                                                                                                                             |
| 2   | Money is held       | Held by GOSI's payment service provider under a dedicated GOSI Opportunities merchant ID. Nothing is paid to the retiree yet.                                                                                             |
| 3   | Session takes place | Video call in the app, as for free sessions. Call join and leave times are logged.                                                                                                                                        |
| 4   | Dispute window      | For 48 hours after the session, the seeker can report a problem, which opens a dispute and keeps the money held.                                                                                                          |
| 5   | Release             | With no dispute, the amount is released to the retiree's balance 48 hours after the session.                                                                                                                              |
| 6   | Settlement          | Released amounts are paid monthly, alongside the pension, to the bank account GOSI already pays the retiree's pension to. Sent as a separate transfer, labelled GOSI Opportunities, never merged into the pension amount. |

Payment uses GOSI's existing payment service provider, with a new merchant ID kept separate from other GOSI products. Payment methods are those the provider already supports for GOSI. Refunds return to the seeker's original payment method.

### Payment states:

Each paid session's amount moves through three states. The retiree's earnings view and the operator's monitoring list show a total for each.

| State    | Meaning                                                                                                                                                                                                                                                                             |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Held     | The seeker has paid, but the amount isn't the retiree's yet. It stays with the payment service provider until the session takes place and the 48-hour dispute window passes. If a dispute is opened, it stays held until the operator decides. A held amount can still be refunded. |
| Released | The 48 hours passed with no dispute, or a dispute was rejected. The amount belongs to the retiree and waits for the next monthly settlement. It can no longer be refunded.                                                                                                          |
| Paid out | The amount has been transferred to the retiree's pension bank account in the monthly settlement. Final.                                                                                                                                                                             |


**Example:** a retiree delivers a paid session on 10 March. The amount is held from 10 to 12 March. With no dispute, it is released on 12 March, then paid out on the next monthly settlement date. Had the seeker raised a dispute on 11 March and been refunded, the amount would never have been released.


## Cancellations, no-shows, and refunds

Seekers are refunded in full in every case where the session doesn't go ahead. Records against either party follow the same rules as free sessions.

| Case                                                | Money                                  | Record                                       |
|-----------------------------------------------------|----------------------------------------|----------------------------------------------|
| Seeker cancels 3 hours or more before               | Full refund                            | None                                         |
| Seeker cancels within 3 hours                       | Full refund                            | Recorded against the seeker                  |
| Seeker doesn't join within 15 minutes of the start  | Full refund                            | Recorded as a seeker no-show                 |
| Retiree cancels, at any time                        | Full refund                            | Within 3 hours, recorded against the retiree |
| Retiree doesn't join within 15 minutes of the start | Full refund                            | Recorded as a missed session                 |
| Retiree paused by GOSI                              | Full refund                            | Booking cancelled, seeker notified           |
| Session delivered, no dispute                       | Released to the retiree after 48 hours | None                                         |

## Disputes

An unhappy seeker uses Report a problem, the same entry point as for free sessions. On a paid session, a report raised within 48 hours of the session opens a dispute.

| Element               | Detail                                                                                                                                                                                                  |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Raising a dispute     | The seeker picks a reason from a fixed list and adds a description. Reasons: retiree didn't attend, session ended early, not the Service Type booked, unprofessional conduct, technical problem, other. |
| Payout                | Held until the dispute is decided, even beyond the 48-hour window. The retiree is notified that a payment is under review.                                                                              |
| Evidence              | Call join and leave times and duration, the seeker's pre-session notes, the rating and tags given, and the seeker's report. Sessions are not recorded.                                                  |
| Retiree input         | Not requested. The operator decides from the logs and the report.                                                                                                                                       |
| Outcomes              | Refund in full, or reject and release the payment to the retiree. No partial refunds.                                                                                                                   |
| Decision time         | Within 10 working days. Both parties are notified of the outcome in the app.                                                                                                                            |
| Effect on the retiree | A dispute decided in the seeker's favour counts as a complaint in the monitoring list. The operator decides whether to send a note or pause. No automatic action.                                       |
| Limits                | One dispute per session. The outcome is final within GOSI Opportunities. A report raised after 48 hours is handled as a normal complaint, with no refund.                                               |


**Example:** a seeker pays for a session on VAT obligations. After 20 minutes the retiree leaves and doesn't return. That evening the seeker reports "session ended early". The payout is held. The operator sees from the call logs that the retiree left at minute 21, refunds the seeker in full, and the case counts as a complaint against the retiree.


## Switching paid sessions off

| Item                           | What happens                                                                                                   |
|--------------------------------|----------------------------------------------------------------------------------------------------------------|
| Confirmed paid bookings        | Cancelled and refunded in full. Both parties notified in the app.                                              |
| Amounts already released       | Paid in the next monthly settlement                                                                            |
| Open disputes and held amounts | Continue to a decision as normal                                                                               |
| Retiree listings               | All Service Types return to free. If the switch is turned on again, retirees choose paid and set prices again. |

## Before the switch can be turned on

- Payment service provider confirms it supports holding funds, refunds, and instructed release under a new merchant ID
- Price floor, ceiling, and suggested price per Category set by management
- Terms and conditions updated with payment, refund, and dispute terms
- Finance process agreed for monthly settlement and reconciliation

# Business Model

**Decided: zero take rate.** GOSI charges no fee on paid sessions and absorbs payment processing costs. The retiree receives the full price the seeker pays. This keeps GOSI's positioning as a platform operator rather than a party earning from the sessions.

# Rollout

| Side              | Approach                                                                                                                                                                         |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Supply (Retirees) | Controlled waves by invitation. Starts small, expands as ops capacity and observed demand allow.                                                                                 |
| Demand (Seekers)  | Open to all GOSI app users aged 18 or over. To avoid an empty marketplace, the first cohort of retirees is invited, approved, and onboarded before the service opens to seekers. |
| Geography         | Nationwide. No geographic restriction. Supply concentration is managed by who is invited, not by where they live.                                                                |
| Categories        | 2: Education and Training, and Accounting and Finance                                                                                                                            |
| Paid sessions     | Off at launch. Switched on only by top management decision, once the dependencies under Paid Sessions are cleared.                                                               |

# Success Metrics

Initial targets for the first three months after launch, to be revised once real data is available.

| KPI                     | Definition                                                                   | Target |
|-------------------------|------------------------------------------------------------------------------|--------|
| Retiree activation rate | Approved retirees delivering at least one session within 30 days of approval | ≥ 60%  |
| Booking fill rate       | Published slots that get booked                                              | ≥ 40%  |
| Seeker repeat rate      | Seekers booking again within 90 days                                         | ≥ 25%  |
| Retiree no-show rate    | Confirmed sessions the retiree did not attend                                | ≤ 5%   |
| Average session rating  | Mean seeker rating out of 5                                                  | ≥ 3.0  |

### When the paid switch is on, also tracked (targets set after switch-on):

| Metric          | Definition                                                                   |
|-----------------|------------------------------------------------------------------------------|
| Paid adoption   | Active retirees with at least one paid Service Type                          |
| Paid engagement | Active retirees with at least one delivered paid session in the last 30 days |
| Dispute rate    | Paid sessions with a dispute raised                                          |
| Refund rate     | Paid sessions refunded for any reason, cancellations included                |

# Analytics

Following the established Google Tags convention within GOSI, here are the events to track.

| Event                           | Trigger                                  |
|---------------------------------|------------------------------------------|
| `opportunities_entry_tapped`    | Card tapped in super-app                 |
| `retiree_application_started`   | Application draft created                |
| `retiree_application_submitted` | Submitted for review                     |
| `retiree_application_decided`   | Ops decision recorded                    |
| `seeker_browse`                 | Browse or search performed               |
| `retiree_profile_viewed`        | Profile opened                           |
| `booking_confirmed`             | Booking made                             |
| `booking_cancelled`             | Cancellation                             |
| `session_started`               | First participant joins                  |
| `session_ended`                 | Both parties left or timeout             |
| `rating_submitted`              | Rating given                             |
| `problem_reported`              | Report raised                            |
| `service_price_set`             | Retiree sets or changes a price          |
| `payment_started`               | Seeker opens payment                     |
| `payment_completed`             | Payment succeeds, booking confirmed      |
| `payment_failed`                | Payment fails or slot hold expires       |
| `refund_issued`                 | Refund sent to the seeker                |
| `dispute_opened`                | Dispute raised on a paid session         |
| `dispute_decided`               | Ops decision recorded                    |
| `payout_released`               | Amount released to the retiree's balance |
