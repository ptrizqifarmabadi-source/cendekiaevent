# Security Specification - Kalender Kegiatan Sekolah

## Data Invariants
- An activity must have a valid name (string, 3-100 chars).
- An activity must have a valid date (Timestamp).
- An activity must have a PIC (string, 2-50 chars).
- An activity must have a type (enum: 'internal', 'external').
- An activity must have at least one category.
- An activity must have an ownerId matching the creator.
- `createdAt` and `updatedAt` must be server-generated.

## The Dirty Dozen Payloads (Red Team Test)
1. **Unauthenticated Write**: Creating an activity without being logged in.
2. **Identity Spoofing**: Creating an activity with an `ownerId` that doesn't match `request.auth.uid`.
3. **Privilege Escalation**: Attempting to update `ownerId` or `createdAt` after creation.
4. **Mass Assignment**: Injecting a `verified: true` field into the activity document.
5. **ID Poisoning**: Creating an activity with a 2MB string as its document ID.
6. **Type Poisoning**: Sending `participantCount` as a string instead of a number.
7. **Boundary Breach**: Setting `participantCount` to -1 or a very large number.
8. **Enum Violation**: Setting `type` to 'invalid_type'.
9. **Relational Theft**: Deleting an activity owned by someone else.
10. **Data Corruption**: Updating an activity to have no categories.
11. **Timestamp Forgery**: Sending a client-side `updatedAt` that doesn't match `request.time`.
12. **Recursive Cost Attack**: (Public read is allowed, but we'll monitor for high-frequency scraping if needed).

## Test Runner (Logic Verification)
- [PASS] Public Read: Anyone can see the list and details.
- [FAIL] Unauthenticated Write: Denied.
- [FAIL] Relational Theft: Denied.

