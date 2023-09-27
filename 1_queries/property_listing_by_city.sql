-------------------------------- PROPERTY LISTING BY CITY  -------------------------------- 

SELECT id, title, cost_per_night, avg(property_reviews.rating) as average_rating
FROM properties 
LEFT JOIN property_reviews ON properties.id = property_id
WHERE city LIKE '%ancouv%'
GROUP BY properties_id
HAVING avg(property_reviews.ratings) >= 4
ORDER BY cost_per_night
LIMIT 10;