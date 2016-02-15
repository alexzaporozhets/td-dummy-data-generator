module.exports = {
  apiUrl: process.env.TD_API_URL || 'https://td-rest-api.herokuapp.com/api/1.0',
  companies: [
    {
      usersAmount: 100,
      activityDays: 5,
      tasks: true
    }
  ]
};
