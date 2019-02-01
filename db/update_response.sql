UPDATE
    contacts
SET
    response = $2
WHERE
    name = $1;