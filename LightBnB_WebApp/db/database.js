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
/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return getAllProperties(null, 2);
};

// ---------------- PROPERTIES  ---------------- //

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
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
