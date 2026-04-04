      table_name      |        column_name         |          data_type          |                  column_default                  | is_nullable 
----------------------+----------------------------+-----------------------------+--------------------------------------------------+-------------
 additional_materials | id                         | integer                     | nextval('additional_materials_id_seq'::regclass) | NO
 additional_materials | content_id                 | integer                     |                                                  | YES
 additional_materials | title                      | character varying           |                                                  | YES
 additional_materials | url                        | text                        |                                                  | YES
 additional_materials | order_index                | integer                     | 0                                                | YES
 additional_materials | type                       | character varying           | 'video'::character varying                       | YES
 admin_invites        | id                         | integer                     | nextval('admin_invites_id_seq'::regclass)        | NO
 admin_invites        | token                      | character varying           |                                                  | NO
 admin_invites        | role                       | character varying           | 'admin'::character varying                       | NO
 admin_invites        | admin_permissions          | ARRAY                       | '{}'::text[]                                     | YES
 admin_invites        | created_by                 | integer                     |                                                  | YES
 admin_invites        | used_by                    | integer                     |                                                  | YES
 admin_invites        | used_at                    | timestamp without time zone |                                                  | YES
 admin_invites        | expires_at                 | timestamp without time zone |                                                  | NO
 admin_invites        | created_at                 | timestamp without time zone | now()                                            | YES
 ambassador_gifts     | id                         | integer                     | nextval('ambassador_gifts_id_seq'::regclass)     | NO
 ambassador_gifts     | user_id                    | integer                     |                                                  | YES
 ambassador_gifts     | milestone_months           | integer                     |                                                  | NO
 ambassador_gifts     | claimed                    | boolean                     | false                                            | YES
 delivery_forms       | id                         | integer                     | nextval('delivery_forms_id_seq'::regclass)       | NO
 delivery_forms       | user_id                    | integer                     |                                                  | YES
 delivery_forms       | name                       | character varying           |                                                  | YES
 delivery_forms       | phone                      | character varying           |                                                  | YES
 delivery_forms       | email                      | character varying           |                                                  | YES
 delivery_forms       | city                       | character varying           |                                                  | YES
 delivery_forms       | street                     | text                        |                                                  | YES
 delivery_forms       | postal_code                | character varying           |                                                  | YES
 delivery_forms       | created_at                 | timestamp without time zone | now()                                            | YES
 habit_logs           | id                         | integer                     | nextval('habit_logs_id_seq'::regclass)           | NO
 habit_logs           | habit_id                   | integer                     |                                                  | YES
 habit_logs           | date                       | date                        |                                                  | NO
 habit_logs           | completed                  | boolean                     | true                                             | YES
 habit_templates      | id                         | integer                     | nextval('habit_templates_id_seq'::regclass)      | NO
 habit_templates      | title                      | character varying           |                                                  | NO
 habit_templates      | description                | text                        |                                                  | YES
 habit_templates      | category                   | character varying           |                                                  | YES
 habit_templates      | source_content_id          | integer                     |                                                  | YES
 habit_templates      | adopted_count              | integer                     | 0                                                | YES
 habit_templates      | created_by_admin           | boolean                     | true                                             | YES
 habit_templates      | created_at                 | timestamp without time zone | now()                                            | YES
 habits               | id                         | integer                     | nextval('habits_id_seq'::regclass)               | NO
 habits               | user_id                    | integer                     |                                                  | YES
 habits               | title                      | character varying           |                                                  | NO
 habits               | template_id                | integer                     |                                                  | YES
 habits               | frequency_type             | character varying           | 'daily'::character varying                       | YES
 habits               | frequency_count            | integer                     | 1                                                | YES
 habits               | deadline                   | date                        |                                                  | YES
 habits               | total_target               | integer                     |                                                  | YES
 habits               | category                   | character varying           |                                                  | YES
 habits               | source_content_id          | integer                     |                                                  | YES
 habits               | created_at                 | timestamp without time zone | now()                                            | YES
 library_sections     | id                         | integer                     | nextval('library_sections_id_seq'::regclass)     | NO
 library_sections     | name                       | character varying           |                                                  | NO
 library_sections     | order_index                | integer                     | 0                                                | YES
 library_sections     | icon                       | character varying           | 'Gem'::character varying                         | YES
 library_subsections  | id                         | integer                     | nextval('library_subsections_id_seq'::regclass)  | NO
 library_subsections  | section_id                 | integer                     |                                                  | YES
 library_subsections  | name                       | character varying           |                                                  | NO
 library_subsections  | order_index                | integer                     | 0                                                | YES
 materials            | id                         | integer                     | nextval('materials_id_seq'::regclass)            | NO
 materials            | title                      | character varying           |                                                  | NO
 materials            | description                | text                        |                                                  | YES
 materials            | section_id                 | integer                     |                                                  | YES
 materials            | subsection_id              | integer                     |                                                  | YES
 materials            | type                       | character varying           | 'video'::character varying                       | YES
 materials            | video_url                  | text                        |                                                  | YES
 materials            | thumbnail_url              | text                        |                                                  | YES
 materials            | is_published               | boolean                     | true                                             | YES
 materials            | created_at                 | timestamp without time zone | now()                                            | YES
 users                | id                         | integer                     | nextval('users_id_seq'::regclass)                | NO
 users                | email                      | character varying           |                                                  | NO
 users                | password_hash              | text                        |                                                  | NO
 users                | name                       | character varying           | ''::character varying                            | YES
 users                | avatar_url                 | text                        |                                                  | YES
 users                | subscription_status        | character varying           | 'inactive'::character varying                    | YES
 users                | subscription_start         | timestamp without time zone |                                                  | YES
 users                | subscription_end           | timestamp without time zone |                                                  | YES
 users                | ambassador_status          | character varying           | 'none'::character varying                        | YES
 users                | ambassador_status_override | boolean                     | false                                            | YES
 users                | delivery_form_submitted    | boolean                     | false                                            | YES
 users                | is_admin                   | boolean                     | false                                            | YES
 users                | created_at                 | timestamp without time zone | now()                                            | YES
 users                | role                       | character varying           | 'user'::character varying                        | YES
 users                | admin_permissions          | ARRAY                       | '{}'::text[]                                     | YES
(84 rows)

