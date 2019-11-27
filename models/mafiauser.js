"use strict";
module.exports = (sequelize, DataTypes) => {
  const mafiauser = sequelize.define("mafiauser", {
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING
    }
  });
  mafiauser.associate = function(models) {
    // associations can be defined here
  };
  return mafiauser;
};
