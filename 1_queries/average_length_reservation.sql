-------------------------------- AVERAGE DURATION OF RESERVATION  -------------------------------- 

SELECT AVG (end_date - start_date) as average_duration
FROM reservations;