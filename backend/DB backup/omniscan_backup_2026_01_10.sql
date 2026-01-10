--
-- PostgreSQL database dump
--

\restrict IsBKWbQOET0zQY67RHfKsl6da6BDsKps9obHRvRm5Jb4hZeceVWBOo5prOnEHSL

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-10 19:52:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16425)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    scan_id integer,
    scores json,
    report_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16424)
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 221
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- TOC entry 224 (class 1259 OID 16492)
-- Name: scan_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scan_files (
    id integer NOT NULL,
    user_id integer NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.scan_files OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16491)
-- Name: scan_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scan_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scan_files_id_seq OWNER TO postgres;

--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 223
-- Name: scan_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scan_files_id_seq OWNED BY public.scan_files.id;


--
-- TOC entry 220 (class 1259 OID 16389)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(50) CONSTRAINT users_password_hash_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(100),
    phone character varying(20)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16388)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4868 (class 2604 OID 16428)
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- TOC entry 4870 (class 2604 OID 16495)
-- Name: scan_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_files ALTER COLUMN id SET DEFAULT nextval('public.scan_files_id_seq'::regclass);


--
-- TOC entry 4866 (class 2604 OID 16392)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5036 (class 0 OID 16425)
-- Dependencies: 222
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, scan_id, scores, report_text, created_at) FROM stdin;
3	3	{"normal": -0.027012967428489687, "opacity": -0.005314295311252333, "pneumonia": -0.03377117548377438, "tumor": -0.0012166170299715076, "fracture": -0.0037695285590136143, "inflammation": -0.011399280633654602, "pleural effusion": -0.044680495863133204, "hemorrhage": -0.013105505805922228, "lesion": -0.0286359090629099}	**Diagnostic Imaging Report**\n\n**Patient Name:** [Patient Name]  \n**Date of Birth:** [DOB]  \n**Patient ID:** [Patient ID]  \n**Date of Exam:** [Exam Date]  \n**Exam Type:** Chest X-ray\n\n---\n\n**1. Clinical Indication**  \nEvaluation for suspected pneumonia based on clinical symptoms.\n\n**2. Technique**  \nPosterior-anterior (PA) and lateral views of the chest were obtained.\n\n**3. Findings**  \n\n**Lungs & Pleura:**  \nThe lung fields demonstrate diffuse opacities, most pronounced in the lower lobes, consistent with infiltrative changes. No pleural effusion is evident. \n\n**Mediastinum & Cardiac Silhouette:**  \nThe cardiac silhouette is within normal limits. No mediastinal shift or significant enlargement of mediastinal structures noted.\n\n**Bones & Soft Tissue:**  \nVisualized bones are intact with no evidence of fracture. Soft tissue structures appear unremarkable.\n\n**4. AI Abnormality Scores**  \n- Normal: -0.0270  \n- Opacity: -0.0053  \n- Pneumonia: -0.0338  \n- Tumor: -0.0012  \n- Fracture: -0.0038  \n- Inflammation: -0.0114  \n- Pleural Effusion: -0.0447  \n- Hemorrhage: -0.0131  \n- Lesion: -0.0286  \n\n**5. Impression**  \nSuggestive findings consistent with pneumonia, notably in the lower lobes. No significant pleural effusion or other acute pathology identified.\n\n**6. Recommendations**  \nClinical correlation is recommended. Consider follow-up imaging or further evaluation based on clinical progression and response to treatment.\n\n---\n\n**Radiologist:** [Radiologist Name]  \n**Date of Report:** [Report Date]  \n**Signature:** ______________________	2025-12-16 19:04:12.19316
4	4	{"normal": 0.010189247235439746, "opacity": -0.010794109996508091, "pneumonia": -0.000708660365480944, "tumor": -0.014248631347208315, "fracture": 0.002366650323345154, "inflammation": -0.02377464015047085, "pleural effusion": -0.016055724879980676, "hemorrhage": -0.0167241013730857, "lesion": -0.01674287735425807}	**Diagnostic Imaging Report**\n\n**Patient Name:** [Patient Name]  \n**Patient ID:** [Patient ID]  \n**Date of Exam:** [Date of Exam]  \n**Referring Physician:** [Referring Physician]  \n**Type of Exam:** [Type of Exam, e.g., Chest X-ray, CT Scan]\n\n---\n\n**1. Clinical Indication**    \nEvaluation of suspected pneumonia due to clinical symptoms of cough and fever.\n\n**2. Technique**  \nImaging was performed using [specific imaging modality, e.g., CT chest, posterior-anterior and lateral X-rays] with standard protocols. No contrast was administered.\n\n**3. Findings**  \n\n**Lungs & Pleura:**   \nThere is [notable opacity] noted in the right lower lobe, consistent with inflammatory process. No pleural effusion is observed. Lung fields otherwise appear clear without focal lesions.\n\n**Mediastinum & Cardiac Silhouette:**   \nMediastinal structures are within normal limits. The cardiac silhouette is unremarkable. No significant lymphadenopathy is identified.\n\n**Bones & Soft Tissue:**   \nVisualized bony structures show no evidence of fracture. Soft tissues surround the thorax appear normal.\n\n**4. AI Abnormality Scores**  \n- Normal: 0.0102  \n- Opacity: -0.0108  \n- Pneumonia: -0.0007  \n- Tumor: -0.0142  \n- Fracture: 0.0024  \n- Inflammation: -0.0238  \n- Pleural Effusion: -0.0161  \n- Hemorrhage: -0.0167  \n- Lesion: -0.0167  \n\n**5. Impression**  \nFindings are suggestive of pneumonia in the right lower lobe with associated opacity. No pleural effusion or complications noted.\n\n**6. Recommendations**  \nConsider clinical correlation and follow-up imaging as needed. Initiate appropriate antibiotic therapy as guided by clinical judgment. Monitor for clinical improvement.\n\n---\n\n**Radiologist:** [Radiologist Name]  \n**Board Certification:** [Board Certified Radiologist]  \n**Date of Report:** [Date of Report]	2025-12-23 18:06:26.953688
5	5	{"normal": -0.004546097234528668, "opacity": -0.018195402675022856, "pneumonia": -0.03166616285452806, "tumor": -0.009035620213319984, "fracture": -0.015880836100629014, "inflammation": -0.03698777066350242, "pleural effusion": -0.0021946712754933317, "hemorrhage": -0.01675521542663752, "lesion": 0.008587067435463185}	**Radiology Report**\n\n**Patient ID:** [Patient ID]  \n**Date of Exam:** [Date of Exam]  \n**Referring Physician:** [Referring Physician]  \n**Exam Type:** Chest X-ray\n\n---\n\n**1. Clinical Indication**  \nEvaluation of persistent cough and shortness of breath.\n\n---\n\n**2. Technique**  \nStandard posterior-anterior and lateral chest radiographs were obtained.\n\n---\n\n**3. Findings**  \n**Lungs & Pleura:**  \n- No significant opacity noted.  \n- No evidence of pneumonia.  \n- No visible pleural effusion.\n\n**Mediastinum & Cardiac Silhouette:**  \n- The cardiac silhouette is within normal limits.  \n- No mediastinal shift noted.\n\n**Bones & Soft Tissue:**  \n- No acute fracture identified.  \n- Soft tissues are unremarkable.\n\n---\n\n**4. AI Abnormality Scores**  \n- Normal: -0.0045  \n- Opacity: -0.0182  \n- Pneumonia: -0.0317  \n- Tumor: -0.0090  \n- Fracture: -0.0159  \n- Inflammation: -0.0370  \n- Pleural Effusion: -0.0022  \n- Hemorrhage: -0.0168  \n- Lesion: 0.0086  \n\n---\n\n**5. Impression**  \nThe chest X-ray demonstrates no significant abnormalities. No evidence of pneumonia, tumor, fracture, or pleural effusion.\n\n---\n\n**6. Recommendations**  \nClinical correlation is advised for persistent symptoms. Consider follow-up imaging if symptoms persist or worsen.  \n\n---\n\n**Radiologist:** [Radiologist Name]  \n**Date of Report:** [Report Date]  \n**Signature:** ________________________	2025-12-23 19:40:54.667836
6	6	{"normal": -0.025100519201248894, "opacity": -0.051532187782628455, "pneumonia": -0.052666389356340736, "tumor": 0.02757255327341801, "fracture": -0.054947570593573275, "inflammation": -0.008272803888759887, "pleural effusion": 0.01312615157396161, "hemorrhage": -0.04589584064277441, "lesion": -0.007630153541945949}	**Diagnostic Imaging Report**  \n**Date:** [Insert Date]  \n**Patient ID:** [Insert Patient ID]  \n**Patient Name:** [Insert Patient Name]  \n**Referring Physician:** [Insert Referring Physician Name]  \n**Exam Type:** [Insert Exam Type, e.g., Chest X-ray, CT Chest]  \n\n---\n\n**1. Clinical Indication**  \nSuspected pneumonia. Evaluate for any pulmonary opacities or other abnormalities.\n\n**2. Technique**  \n[Description of the imaging technique used, e.g., "PA and lateral chest X-rays were obtained. Images were reviewed in various planes as appropriate."]\n\n**3. Findings**  \n\n**Lungs & Pleura:**  \nThere are no significant opacities noted in the lung parenchyma. No pleural effusion or significant airspace consolidation is observed. Mild inflammatory changes may be present, but no definitive pneumonia is identified.\n\n**Mediastinum & Cardiac Silhouette:**  \nThe mediastinum is within normal limits. The cardiac silhouette is normal in size and contour, with no signs of pericardial effusion.\n\n**Bones & Soft Tissue:**  \nNo fractures or acute bony abnormalities are noted. The soft tissues of the chest are unremarkable.\n\n**4. AI Abnormality Scores**  \n- Normal: -0.0251  \n- Opacity: -0.0515  \n- Pneumonia: -0.0527  \n- Tumor: 0.0276  \n- Fracture: -0.0549  \n- Inflammation: -0.0083  \n- Pleural Effusion: 0.0131  \n- Hemorrhage: -0.0459  \n- Lesion: -0.0076  \n\n**5. Impression**  \nNo evidence of pneumonia or significant lung pathology. Normal study with no acute findings.\n\n**6. Recommendations**  \nClinical correlation is advised. Follow-up imaging may be considered if clinical symptoms persist or worsen.  \n\n---\n\n**Radiologist:** [Insert Radiologist Name, MD]  \n**Board Certification:** [Insert Board Certification Details]  \n**Signature:** [Insert Digital Signature]  \n**Report Audited By:** [Insert Name & Date if applicable]  	2025-12-23 19:41:32.970754
7	7	{"normal": -0.009444389688117193, "opacity": -0.02518954511011115, "pneumonia": -0.04323156463251387, "tumor": -0.008159204496296698, "fracture": -0.022073455517978516, "inflammation": -0.025851657231773968, "pleural effusion": -0.016289756022697832, "hemorrhage": -0.018995891627807716, "lesion": 0.011377538624017176}	**Diagnostic Imaging Report**\n\n**Patient ID:** [Patient ID]  \n**Date of Study:** [Date]  \n**Referring Physician:** [Referring Physician]  \n**Study Type:** [Study Type - e.g., Chest X-Ray, CT Scan]  \n**Radiologist:** [Radiologist Name]  \n**Report Date:** [Current Date]  \n\n---\n\n**1. Clinical Indication**  \nPatient presents with a persistent cough and shortness of breath. Rule out pneumonia and other pulmonary pathologies.\n\n**2. Technique**  \nImaging performed using [imaging technique, e.g., frontal and lateral chest X-rays or CT chest]. Standard protocol followed. No contrast administered.\n\n**3. Findings**  \n\n- **Lungs & Pleura:** \n  No significant opacities are noted within the lung fields. No pleural effusion detected. The bronchial structures appear normal. No focal lesions or consolidation observed.\n  \n- **Mediastinum & Cardiac Silhouette:**  \nThe mediastinum is unremarkable, with no shifting structures. The cardiac silhouette is within normal limits. No enlarged lymph nodes visualized in the mediastinal region.\n\n- **Bones & Soft Tissue:**  \nNo acute fractures identified. The bony structures appear intact. Soft tissues minimally unremarkable.\n\n**4. AI Abnormality Scores**  \n- Normal: -0.0094  \n- Opacity: -0.0252  \n- Pneumonia: -0.0432  \n- Tumor: -0.0082  \n- Fracture: -0.0221  \n- Inflammation: -0.0259  \n- Pleural Effusion: -0.0163  \n- Hemorrhage: -0.0190  \n- Lesion: 0.0114  \n\n**5. Impression**  \nFindings are predominantly normal with no evidence of pneumonia, tumors, fractures, or pleural effusion. \n\n**6. Recommendations**  \nContinue clinical correlation and consider follow-up imaging if symptoms persist. Monitor for any changes in respiratory status. \n\n--- \n\n**Signature**  \n[Digitally signed Radiologist Name, MD]  \n[Board-Certified Radiologist]  \n[Contact Information]	2025-12-23 19:42:39.632362
8	8	{"normal": -0.010939746302170282, "opacity": -0.03147056919447941, "pneumonia": -0.022345444769444188, "tumor": 0.033565270691291144, "fracture": -0.039527788249711655, "inflammation": -0.016834918226900766, "pleural effusion": 0.013676531953749113, "hemorrhage": -0.052865905961478867, "lesion": -0.008073933317514676}	**Diagnostic Imaging Report**\n\n**Patient Name:** [Patient's Name]  \n**Date of Study:** [Date]  \n**Referring Physician:** [Referring Physician Name]  \n**Clinical Indication:** [Brief Clinical History/Reason for Exam]\n\n---\n\n**Technique:**  \nA high-resolution CT scan of the chest was performed without intravenous contrast with standard protocols to evaluate for [specific indications such as suspected pneumonia, mass, etc.].\n\n---\n\n**Findings:**  \n\n***Lungs & Pleura:***  \n- No significant opacities noted within the lung parenchyma.  \n- No signs of pneumonia identified.  \n- Visually assessed pleural spaces are clear, without effusion demonstrated.\n\n***Mediastinum & Cardiac Silhouette:***  \n- The mediastinum appears unremarkable with no enlarged lymph nodes.  \n- Cardiac silhouette is normal in size and contour. No pericardial effusion is present.\n\n***Bones & Soft Tissue:***  \n- Skeletal evaluation reveals no acute fractures.  \n- No abnormal soft tissue masses are identified.\n\n---\n\n**AI Abnormality Scores:**  \n- Normal: -0.0109  \n- Opacity: -0.0315  \n- Pneumonia: -0.0223  \n- Tumor: 0.0336  \n- Fracture: -0.0395  \n- Inflammation: -0.0168  \n- Pleural Effusion: 0.0137  \n- Hemorrhage: -0.0529  \n- Lesion: -0.0081   \n\n---\n\n**Impression:**  \nThe study demonstrates no significant lung or pleural abnormalities. No evidence of pneumonia, tumors, or fractures is seen.\n\n---\n\n**Recommendations:**  \nContinue clinical correlation and follow-up as per the referring physician's discretion. If symptoms persist, consider repeat imaging or further evaluation. \n\n--- \n\n**Radiologist:** [Radiologist Name, MD]  \n**Board Certified Radiologist**  \n**[Radiologist Contact Information]**  \n**Report Date:** [Current Date]	2025-12-23 19:43:29.297852
\.


--
-- TOC entry 5038 (class 0 OID 16492)
-- Dependencies: 224
-- Data for Name: scan_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scan_files (id, user_id, file_name, file_path, file_hash, created_at) FROM stdin;
3	7	lungScan.jpeg	/uploads/scans/lungScan.jpeg	0c76183f626a7d55d966bc61d7b84c488f4e0d34b001660b4ac80a48a8dc004b	2025-12-16 19:04:00.826024
4	7	test2.png	/uploads/scans/test2.png	83dc2026ea4bbe40a8a8dfed035f3d5475f7fda145e8a7903f5e091603267141	2025-12-23 18:06:12.747017
5	7	Screenshot 2025-12-23 193833.png	/uploads/scans/Screenshot 2025-12-23 193833.png	df587b12ae35a5d4368ffe0532ad5c3031c205bc47ab739a5bd83c3f1f7bfe7f	2025-12-23 19:40:44.432277
6	7	Screenshot 2025-12-23 193908.png	/uploads/scans/Screenshot 2025-12-23 193908.png	4389413eb6a9e13b8ad91b1636c1cd87e04379cba92fb97c3125d37ac4a7c2d3	2025-12-23 19:41:22.860484
7	7	Screenshot 2025-12-23 193944.png	/uploads/scans/Screenshot 2025-12-23 193944.png	77650920e876e680b908eca42ef965e4ec816e99a4c0628bf958f088ed948077	2025-12-23 19:42:28.539348
8	7	Screenshot 2025-12-23 194010.png	/uploads/scans/Screenshot 2025-12-23 194010.png	5f43b3f883e90bdd1eaa76aa5897f3d45517388ad07ba1dd600a09925cd50b73	2025-12-23 19:43:19.265197
\.


--
-- TOC entry 5034 (class 0 OID 16389)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, name, phone) FROM stdin;
4	admin	admin@gmail.com	admin123	2025-12-04 19:52:31.466502	\N	\N
5	gopi	gopi@gmail.com	test123	2025-12-04 19:52:31.466502	\N	\N
6	Hani	hani@gmail.com	Abc@123456	2025-12-05 09:35:35.720247	Hanisha	1234567890
7	pinky	bhavana@gmail.com	pinky123	2025-12-05 09:37:25.325998	Bhavana	3456789090
\.


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 221
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 8, true);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 223
-- Name: scan_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scan_files_id_seq', 8, true);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- TOC entry 4881 (class 2606 OID 16434)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 16505)
-- Name: scan_files scan_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_files
    ADD CONSTRAINT scan_files_pkey PRIMARY KEY (id);


--
-- TOC entry 4873 (class 2606 OID 16405)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4875 (class 2606 OID 16453)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4877 (class 2606 OID 16401)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 16403)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4884 (class 2606 OID 16511)
-- Name: reports reports_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.scan_files(id) ON DELETE CASCADE;


--
-- TOC entry 4885 (class 2606 OID 16506)
-- Name: scan_files scan_files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_files
    ADD CONSTRAINT scan_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-10 19:52:18

--
-- PostgreSQL database dump complete
--

\unrestrict IsBKWbQOET0zQY67RHfKsl6da6BDsKps9obHRvRm5Jb4hZeceVWBOo5prOnEHSL

