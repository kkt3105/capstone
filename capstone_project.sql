use capstone_project;

create table user (
login_id varchar(15) primary key,
login_pw varchar(15) not null,
user_type varchar(15) not null,
user_name varchar(20) not null,
user_age int(3) not null,
user_gender varchar(4) not null,
user_address varchar(100) not null,
user_tel varchar(11) not null,
latitude varchar(15) not null,
logitude varchar(15) not null
);

create table senior_list (
login_id varchar(15) ,
target_zone_min int(3) not null,
target_zone_max int(3) not null,
primary key (login_id),
foreign key (login_id) references user (login_id)
);

create table volunteer_list (
login_id varchar(15),
time int(5) not null,
primary key (login_id),
foreign key (login_id) references user (login_id)
);

create table manager_list (
login_id varchar(15),
primary key (login_id),
foreign key (login_id) references user (login_id)
);

create table authentication (
login_id varchar(15),
token varchar(13) not null,
primary key (login_id),
foreign key (login_id) references user (login_id)
);

create table management_info (
manager_id varchar(15),
senior_id varchar(15),
date varchar(14) not null,
primary key (manager_id, senior_id),
foreign key (manager_id) references user (login_id),
foreign key (senior_id) references user (login_id)
);

create table volunteer_info (
volunteer_id varchar(15),
senior_id varchar(15),
start_time varchar(14) not null,
end_time varchar(14) not null,
primary key (volunteer_id, senior_id, start_time, end_time),
foreign key (volunteer_id) references user (login_id),
foreign key (senior_id) references user (login_id)
);

create table heartrate_log(
login_id varchar(15),
date varchar(14),
heartrate int(3) not null,
primary key (login_id, date),
foreign key (login_id) references user (login_id)
);

create table activity_log (
login_id varchar(15),
type_of_sensor int(1),
date varchar(14),
modified_data varchar(10) not null,
primary key (login_id, type_of_sensor, date),
foreign key (login_id) references user (login_id)
);
