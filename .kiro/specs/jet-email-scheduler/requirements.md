# Requirements Document

## Introduction

Jet is a web application for scheduling automated email reports that deliver data updates from a datalake. Users can create email templates with an HTML editor, define recipients (either manually or from a datalake table), attach report data as CSV, and include aggregations of the data within the email body. The scheduling is handled externally via Airflow DAGs.

## Glossary

- **Jet**: The email scheduling web application
- **Email_Template**: An HTML template that defines the structure and content of the email
- **Recipient_List**: A collection of email addresses that will receive the report
- **Report**: A table from the datalake exported as CSV and attached to the email
- **Aggregation**: A computed summary (e.g., sum, average, count) of data from the report table displayed in the email body
- **Datalake**: The external data storage system containing tables and user data
- **DAG**: Directed Acyclic Graph used by Airflow for scheduling

## Requirements

### Requirement 1: Create Email Template

**User Story:** As a user, I want to create and edit HTML email templates, so that I can design the appearance and content of my scheduled reports.

#### Acceptance Criteria

1. WHEN a user opens the email editor, THE Jet_System SHALL display an HTML editor interface
2. WHEN a user enters HTML content and saves, THE Jet_System SHALL persist the email template
3. WHEN a user loads an existing template, THE Jet_System SHALL display the previously saved HTML content
4. IF a user attempts to save an empty template, THEN THE Jet_System SHALL prevent the save and display a validation error
5. WHEN a user edits an existing template, THE Jet_System SHALL update the stored template with the new content

### Requirement 2: Define Recipients

**User Story:** As a user, I want to define who receives the email report, so that the right people get the data updates.

#### Acceptance Criteria

1. WHEN a user selects manual recipient entry, THE Jet_System SHALL allow entering a list of email addresses
2. WHEN a user selects datalake-based recipients, THE Jet_System SHALL allow selecting a table from the datalake as the recipient source
3. WHEN a user adds an email address to the manual list, THE Jet_System SHALL validate the email format
4. IF a user enters an invalid email address, THEN THE Jet_System SHALL reject the entry and display a validation error
5. WHEN a user saves the recipient configuration, THE Jet_System SHALL persist the recipient list or table reference

### Requirement 3: Define Report Data Source

**User Story:** As a user, I want to specify which datalake table to include as a report, so that recipients receive the relevant data as a CSV attachment.

#### Acceptance Criteria

1. WHEN a user configures a report, THE Jet_System SHALL allow selecting a table from the datalake
2. WHEN a user saves the report configuration, THE Jet_System SHALL store the table reference for CSV generation
3. WHEN the email is sent, THE Jet_System SHALL export the selected table as a CSV attachment
4. IF the selected table does not exist, THEN THE Jet_System SHALL display an error message

### Requirement 4: Define Aggregations

**User Story:** As a user, I want to define aggregations of the report data to display in the email body, so that recipients can see summary statistics without opening the attachment.

#### Acceptance Criteria

1. WHEN a user configures aggregations, THE Jet_System SHALL allow selecting columns from the report table
2. WHEN a user defines an aggregation, THE Jet_System SHALL support aggregation types including sum, average, count, min, and max
3. WHEN a user saves aggregation definitions, THE Jet_System SHALL persist the aggregation configuration
4. WHEN the email is generated, THE Jet_System SHALL compute the aggregations and insert them into the email body
5. WHEN a user references an aggregation in the template, THE Jet_System SHALL replace the placeholder with the computed value

### Requirement 5: Preview Email

**User Story:** As a user, I want to preview the email before scheduling, so that I can verify the template, aggregations, and overall appearance.

#### Acceptance Criteria

1. WHEN a user requests a preview, THE Jet_System SHALL render the email template with sample or live data
2. WHEN a user previews an email with aggregations, THE Jet_System SHALL compute and display the aggregation values
3. WHEN a user previews an email, THE Jet_System SHALL show the recipient list or count
4. IF the template contains errors, THEN THE Jet_System SHALL display the errors in the preview

### Requirement 6: Save Email Configuration

**User Story:** As a user, I want to save the complete email configuration with a label, so that it can be identified and scheduled by Airflow.

#### Acceptance Criteria

1. WHEN a user saves an email configuration, THE Jet_System SHALL require a label/name for the configuration
2. WHEN a user saves an email configuration, THE Jet_System SHALL persist the label, template, recipients, report source, and aggregations as a single configuration
3. WHEN a user lists saved configurations, THE Jet_System SHALL display all available email configurations with their labels
4. WHEN a user searches for a configuration, THE Jet_System SHALL allow filtering by label
5. WHEN a user edits a saved configuration, THE Jet_System SHALL load all associated settings for modification
6. WHEN a user deletes a configuration, THE Jet_System SHALL remove the configuration from storage
7. THE Jet_System SHALL expose the configuration in a format consumable by Airflow DAGs
