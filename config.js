module.exports = {
  apiUrl: process.env.TD_API_URL || 'https://td-rest-api.herokuapp.com/api/1.0',
  companies: [
    {
      usersAmount: 10,
      activityDays: 3,
      tasks: false
    }
  ]
};
