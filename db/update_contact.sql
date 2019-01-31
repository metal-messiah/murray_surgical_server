UPDATE
    contacts
SET
    name = $1,
    phone = $2,
    date = $3,
    time = $4
WHERE
    name = $1;