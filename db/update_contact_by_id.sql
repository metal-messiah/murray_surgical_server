UPDATE
    contacts
SET
    name = $1,
    phone = $2,
    date = $3,
    time = $4,
    reason = $5,
    updated_at = $6,
    lang = $7
WHERE
    id = $8;