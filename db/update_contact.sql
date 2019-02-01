UPDATE
    contacts
SET
    name = $1,
    phone = $2,
    date = $3,
    time = $4,
    updated_at = $5
WHERE
    phone = $2;