UPDATE
    contacts
SET
    surveyed_at = $2
WHERE
    id = $1;