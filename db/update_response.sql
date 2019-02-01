UPDATE
    contacts
SET
    response = $2,
    updated_at = $3
WHERE
    phone = $1;