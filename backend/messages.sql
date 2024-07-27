CREATE TABLE Messages (
id	int NOT NULL AUTO_INCREMENT,
content	varchar(255) NOT NULL,
img varchar(255),
createdAt datetime DEFAULT CURRENT_TIMESTAMP(),
updatedAt datetime DEFAULT CURRENT_TIMESTAMP(),
PRIMARY KEY (id)
);