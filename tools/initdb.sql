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
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
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
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (patients_id) REFERENCES patients (id) ON DELETE CASCADE
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
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (patients_id) REFERENCES patients (id) ON DELETE CASCADE
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
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (patients_id) REFERENCES patients (id) ON DELETE CASCADE
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
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (patients_id) REFERENCES patients (id) ON DELETE CASCADE
);

-- DROP TABLE dental_info;
DROP TABLE IF EXISTS diagnosis_info;

CREATE TABLE IF NOT EXISTS diagnosis_info
(
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patients_id integer NOT NULL,
    blood_pressure character varying(20),
    pulse character varying(20),
    breaths character varying(20),
    blood_sugar  character varying(20),
    t_55  character varying(2),
    t_54  character varying(2),
    t_53  character varying(2),
    t_52  character varying(2),
    t_51  character varying(2),
    t_61  character varying(2),
    t_62  character varying(2),
    t_63  character varying(2),
    t_64  character varying(2),
    t_65  character varying(2),
    t_18  character varying(2),
    t_17  character varying(2),
    t_16  character varying(2),
    t_15  character varying(2),
    t_14  character varying(2),
    t_13  character varying(2),
    t_12  character varying(2),
    t_11  character varying(2),
    t_21  character varying(2),
    t_22  character varying(2),
    t_23  character varying(2),
    t_24  character varying(2),
    t_25  character varying(2),
    t_26  character varying(2),
    t_27  character varying(2),
    t_28  character varying(2),
    t_48  character varying(2),
    t_47  character varying(2),
    t_46  character varying(2),
    t_45  character varying(2),
    t_44  character varying(2),
    t_43  character varying(2),
    t_42  character varying(2),
    t_41  character varying(2),
    t_31  character varying(2),
    t_32  character varying(2),
    t_33  character varying(2),
    t_34  character varying(2),
    t_35  character varying(2),
    t_36  character varying(2),
    t_37  character varying(2),
    t_38  character varying(2),
    t_85  character varying(2),
    t_84  character varying(2),
    t_83  character varying(2),
    t_82  character varying(2),
    t_81  character varying(2),
    t_71  character varying(2),
    t_72  character varying(2),
    t_73  character varying(2),
    t_74  character varying(2),
    t_75  character varying(2),
    t_others text,
    is_radiograph_iopa BOOLEAN NOT NULL DEFAULT FALSE,
    is_radiograph_opg BOOLEAN NOT NULL DEFAULT FALSE,
    is_radiograph_occlusal BOOLEAN NOT NULL DEFAULT FALSE,
    is_radiograph_bitewing BOOLEAN NOT NULL DEFAULT FALSE,
    radiograph_others text,
    diagnosis character varying(20),
    treatment_plan text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (patients_id) REFERENCES patients (id) ON DELETE CASCADE
);
