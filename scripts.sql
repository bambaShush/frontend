CREATE DATABASE DogGrooming;
GO

USE DogGrooming;
GO

CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
	FirstName NVARCHAR(50),
    PasswordHash VARBINARY(MAX) NOT NULL,
    PasswordSalt VARBINARY(MAX) NOT NULL
);
GO



CREATE TABLE Appointments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    AppointmentDate DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
	IsDeleted bit NOT NULL default  0,
    FOREIGN KEY (UserId) REFERENCES Users(Id) 
);



CREATE OR ALTER PROCEDURE GetAppointments
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Appointments.*, FirstName as UserFirstName
    FROM Appointments(nolock) join Users(nolock) on UserId = Users.Id
	WHERE AppointmentDate > GETDATE() and IsDeleted = 0
    ORDER BY AppointmentDate ASC;
END;




GO