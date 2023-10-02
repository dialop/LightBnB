const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  host: 'localhost',
  database: 'lightbnb',
  password: 'labber',
  port: 5432,
});


// ---------------- USERS ---------------- //
const getUserWithEmail = function(email) {
  const queryString = `
  SELECT *  
  FROM users
  WHERE email $1
  `;
  return pool
    .query(queryString, [email])
    .then(res => res.rows[0] || null)
    .catch(err => console.error('query error', err.stack));
};

const getUserWithId = function(id) {
  const querySting = `
  SELECT * 
  FROM users
  WHERE id = $1
  `;
  return pool
    .query(querySting, [id])
    .then(res => res.rows[0] || null)
    .catch(err => console.error('query error', err.stack));
};


const addUser = function(user) {
  const querySting = `
  INSERT INTO users (name, email, password)   
  VALUES ($1, $2, $3)
  RETURNING *; 
  `;
  const values = [user.name, user.email, user.password];
  return pool
    .query(querySting, values)
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
  
  let queryString = `
  SELECT properties.*, AVG(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  
  let whereClauses = [];
  
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    whereClauses.push(`city LIKE $${queryParams.length}`);
  }
  
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    whereClauses.push(`owner_id = $${queryParams.length}`);
  }
  
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    const minPrice = options.minimum_price_per_night * 100;
    const maxPrice = options.maximum_price_per_night * 100;
    queryParams.push(minPrice, maxPrice);
    whereClauses.push(`cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);
  }
  
  if (whereClauses.length > 0) {
    queryString += ' WHERE ' + whereClauses.join(' AND ');
  }

  queryString += `
  GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += ` HAVING AVG(property_reviews.rating) >= $${queryParams.length}`;
  }
  
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;
  
  console.log(queryString, queryParams);
  
  return pool.query(queryString, queryParams).then((res) => res.rows);
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
