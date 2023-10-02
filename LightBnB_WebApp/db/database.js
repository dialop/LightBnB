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
const getUserWithEmail = function (email) {
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

const getUserWithId = function (id) {
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


const addUser = function (user) {
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

const getAllReservations = function (guest_id, limit = 10) {
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
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
