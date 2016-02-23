module.exports = {
  apiUrl: process.env.TD_API_URL || 'https://td-rest-api.herokuapp.com/api/1.0',
  companies: [
    {
      usersAmount: 15,
      daysForward: 8,
      activityDays: 12,
      tasks: true
    }
  ]
};
