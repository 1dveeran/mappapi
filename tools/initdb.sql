-- Drops guitars table
DROP TABLE IF EXISTS guitars;

-- Creates guitars table
CREATE TABLE IF NOT EXISTS guitars (
    id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    , user_id varchar(50) NOT NULL
    , brand varchar(50) NOT NULL
    , model varchar(50) NOT NULL
    , year smallint NULL
    , color varchar(50) NULL
);

-- DROP TABLE users;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users
(
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY
  username character varying(100) NOT NULL,
  password character varying NOT NULL,
  salt character varying NOT NULL,
  iterations integer NOT NULL,
  email character varying(100) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- DROP TABLE patients;
DROP TABLE IF EXISTS patients;

CREATE TABLE IF NOT EXISTS patients
(
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name character varying(100) NOT NULL,
  last_name character varying(100) NOT NULL,
  joining_date timestamp with time zone NOT NULL DEFAULT now(),
  current_address text,
  profession character varying(100),
  telephone_no character varying(20),
  mobile_no character varying(20),
  sex character varying(10),
  age integer DEFAULT 1,
  marital_status BOOLEAN NOT NULL DEFAULT FALSE,
  birth_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- DROP TABLE medical_info_checklist;
DROP TABLE IF EXISTS medical_info_checklist;

CREATE TABLE IF NOT EXISTS medical_info_checklist
(
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patients_id integer NOT NULL,
  aids BOOLEAN NOT NULL DEFAULT FALSE,
  cancer BOOLEAN NOT NULL DEFAULT FALSE,
  liver_disease BOOLEAN NOT NULL DEFAULT FALSE,
  tb BOOLEAN NOT NULL DEFAULT FALSE,
  asthma BOOLEAN NOT NULL DEFAULT FALSE,
  diabetes BOOLEAN NOT NULL DEFAULT FALSE,
  kidney_disease BOOLEAN NOT NULL DEFAULT FALSE,
  rheumatic_disease BOOLEAN NOT NULL DEFAULT FALSE,
  arthritis BOOLEAN NOT NULL DEFAULT FALSE,
  epilepsy BOOLEAN NOT NULL DEFAULT FALSE,
  psychiatric_treatment BOOLEAN NOT NULL DEFAULT FALSE,
  thyroid_problems BOOLEAN NOT NULL DEFAULT FALSE,
  blood_disease BOOLEAN NOT NULL DEFAULT FALSE,
  hepatitis BOOLEAN NOT NULL DEFAULT FALSE,
  radiation_treatment BOOLEAN NOT NULL DEFAULT FALSE,
  ulcer BOOLEAN NOT NULL DEFAULT FALSE,
  bp BOOLEAN NOT NULL DEFAULT FALSE,
  herpes BOOLEAN NOT NULL DEFAULT FALSE,
  respiratory_disease BOOLEAN NOT NULL DEFAULT FALSE,
  venereal_disease BOOLEAN NOT NULL DEFAULT FALSE,
  heart_problems BOOLEAN NOT NULL DEFAULT FALSE,
  jaundice BOOLEAN NOT NULL DEFAULT FALSE,
  corticosteriod_treatment BOOLEAN NOT NULL DEFAULT FALSE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- DROP TABLE medical_info;
DROP TABLE IF EXISTS medical_info;

CREATE TABLE IF NOT EXISTS medical_info
(
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patients_id integer NOT NULL,
  is_nursing BOOLEAN NOT NULL DEFAULT FALSE,
  is_pregnant BOOLEAN NOT NULL DEFAULT FALSE,
  pregnancy_due_date date NOT NULL DEFAULT now(),
  is_chewing BOOLEAN NOT NULL DEFAULT FALSE,
  is_smoking BOOLEAN NOT NULL DEFAULT FALSE,
  cigarette_count INTEGER DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- DROP TABLE medical_info;
DROP TABLE IF EXISTS medication;

CREATE TABLE IF NOT EXISTS medication
(
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patients_id integer NOT NULL,
  medicine_list text,
  is_allergic_penicillin BOOLEAN NOT NULL DEFAULT FALSE,
  is_allergic_sulfa BOOLEAN NOT NULL DEFAULT FALSE,
  is_allergic_aspirin BOOLEAN NOT NULL DEFAULT FALSE,
  is_allergic_iodine BOOLEAN NOT NULL DEFAULT FALSE,
  is_allergic_localanaes BOOLEAN NOT NULL DEFAULT FALSE,
  is_allergic_ibuprofen BOOLEAN NOT NULL DEFAULT FALSE,
  any_other text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- DROP TABLE dental_info;
DROP TABLE IF EXISTS dental_info;

CREATE TABLE IF NOT EXISTS dental_info
(
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patients_id integer NOT NULL,
  chief_compliant text,
  past_dental_history text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
