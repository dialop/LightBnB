
// ---------------- DEPENDENCIES ---------------- //
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE
});

// ---------------- USERS ---------------- //
const getUserWithEmail = function(email) {
  const queryString = `
  SELECT *  
  FROM users
  WHERE email = $1
  `;
  return pool
    .query(queryString, [email])
    .then(res => res.rows[0] || null)
    .catch(err => console.error('query error', err.stack));
};

const getUserWithId = function(id) {
  const queryString = `
  SELECT * 
  FROM users
  WHERE id = $1
  `;
  return pool
    .query(queryString, [id])
    .then(res => res.rows[0] || null)
    .catch(err => console.error('query error', err.stack));
};


const addUser = function(user) {
  const queryString = `
  INSERT INTO users (name, email, password)   
  VALUES ($1, $2, $3)
  RETURNING *; 
  `;
  const values = [user.name, user.email, user.password];
  return pool
    .query(queryString, values)
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};

// ---------------- RESERVATIONS ---------------- //
const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `
  SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  AND reservations.end_date < NOW()::date
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date DESC
  LIMIT $2;
  `;
  const resValue = [guest_id, limit];

  return pool
    .query(queryString, resValue)
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
};


// ---------------- PROPERTIES  ---------------- //
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  const queryValues = [];

  let queryString = `
    SELECT properties.*, AVG(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryValues.push(`%${options.city}%`);
    queryString += ` WHERE city LIKE $${queryParams.length}`;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryValues.push(options.owner_id);
    queryString += ` AND owner_id = $${queryParams.length}`;
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    const minPrice = options.minimum_price_per_night * 100;
    const maxPrice = options.maximum_price_per_night * 100;
    queryParams.push(minPrice, maxPrice);
    queryValues.push(minPrice, maxPrice);
    queryString += ` AND cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
  }

  queryString += `
    GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryValues.push(options.minimum_rating);
    queryString += ` HAVING AVG(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryValues.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryValues);

  return pool.query(queryString, queryValues).then((res) => res.rows);
};

const addProperty = function(property) {

  const queryString = `
  INSERT INTO properties (
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  ) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14
  ) RETURNING *;
`;

  const queryParams = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ];

  return pool.query(queryString, queryParams)
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
