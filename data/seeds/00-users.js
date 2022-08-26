
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').truncate()
  await knex('users').insert([
    { username: 'abby', password: "$2a$08$ICyCeJpEgMIvIdtLrZAGXOK3Z/EAw5w1R4bEfUMqrnwrODFLP8yTq" }, // 1234
    { username: 'hugo', password: "$2a$08$ICyCeJpEgMIvIdtLrZAGXOK3Z/EAw5w1R4bEfUMqrnwrODFLP8yTq"} // 1234
  ]);
};
