-------------------------------- MOST VISITED CITIES  -------------------------------- 

SELECT properties.city, count(reservations) as total_reservations
FROM reservations
JOIN properties ON property.id = properties.id
GROUP BY properties.city
ORDER BY total_reservations DESC;