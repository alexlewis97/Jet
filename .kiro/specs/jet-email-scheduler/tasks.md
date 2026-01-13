# Implementation Plan: Jet Email Scheduler

## Overview

This plan implements the Jet email scheduling system using TypeScript with a layered architecture. Tasks are organized to build incrementally, starting with core data models and services, then adding validation, aggregation, preview, and finally the configuration management layer.

## Tasks

- [x] 1. Set up project structure and core types
  - Initialize TypeScript project with Node.js
  - Create directory structure: `src/models`, `src/services`, `src/validators`, `src/utils`
  - Define core interfaces and types from design document
  - Set up testing framework (Jest with fast-check for property tests)
  - _Requirements: All_

- [x] 2. Implement Template Service
  - [x] 2.1 Create Template model and TemplateService implementation
    - Implement `createTemplate`, `getTemplate`, `updateTemplate`, `deleteTemplate`
    - Implement `validateTemplate` to check for empty content
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Write property test for template persistence round-trip
    - **Property 1: Template Persistence Round-Trip**
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 2.3 Write property test for empty template rejection
    - **Property 2: Empty Template Rejection**
    - **Validates: Requirements 1.4**

  - [ ]* 2.4 Write property test for template update persistence
    - **Property 3: Template Update Persistence**
    - **Validates: Requirements 1.5**

- [x] 3. Implement Email Validation
  - [x] 3.1 Create email validator utility
    - Implement `validateEmail` function with proper format checking
    - Handle edge cases: empty strings, missing @, missing domain
    - _Requirements: 2.3, 2.4_

  - [ ]* 3.2 Write property test for email validation correctness
    - **Property 4: Email Validation Correctness**
    - **Validates: Requirements 2.3**

- [x] 4. Implement Recipient Service
  - [x] 4.1 Create RecipientConfig model and RecipientService implementation
    - Implement `setManualRecipients` with email validation
    - Implement `setDatalakeRecipients` with table reference storage
    - Implement `getRecipients` and `resolveRecipients`
    - _Requirements: 2.1, 2.2, 2.5_

  - [ ]* 4.2 Write property test for recipient configuration round-trip
    - **Property 5: Recipient Configuration Round-Trip**
    - **Validates: Requirements 2.5**

- [x] 5. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Report Service
  - [x] 6.1 Create ReportConfig model and ReportService implementation
    - Implement `setReportSource` and `getReportSource`
    - Implement `validateTableExists` (mock datalake connection)
    - Implement `getTableColumns` for column metadata
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 6.2 Implement CSV generation
    - Implement `generateCsv` to export table data
    - Handle proper CSV escaping for special characters
    - _Requirements: 3.3_

  - [ ]* 6.3 Write property test for report configuration round-trip
    - **Property 6: Report Configuration Round-Trip**
    - **Validates: Requirements 3.2**

  - [ ]* 6.4 Write property test for CSV export completeness
    - **Property 7: CSV Export Completeness**
    - **Validates: Requirements 3.3**

- [x] 7. Implement Aggregation Service
  - [x] 7.1 Create AggregationConfig model and AggregationService implementation
    - Implement `addAggregation`, `removeAggregation`, `getAggregations`
    - Implement `computeAggregations` for sum, average, count, min, max
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 7.2 Write property test for aggregation computation correctness
    - **Property 8: Aggregation Computation Correctness**
    - **Validates: Requirements 4.2**

- [x] 8. Implement Template Rendering
  - [x] 8.1 Create template renderer utility
    - Implement placeholder detection and replacement
    - Support aggregation placeholders in format `{{aggregation.label}}`
    - _Requirements: 4.4, 4.5_

  - [ ]* 8.2 Write property test for placeholder replacement
    - **Property 9: Template Placeholder Replacement**
    - **Validates: Requirements 4.4, 4.5**

- [x] 9. Checkpoint - Data processing complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Preview Service
  - [x] 10.1 Create PreviewService implementation
    - Implement `generatePreview` combining template, aggregations, recipients
    - Implement `renderTemplate` with aggregation value insertion
    - Return recipient count and error list
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 10.2 Write property test for preview generation completeness
    - **Property 10: Preview Generation Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 11. Implement Configuration Service
  - [x] 11.1 Create EmailConfiguration model and ConfigurationService implementation
    - Implement `createConfiguration` with label validation
    - Implement `getConfiguration`, `listConfigurations`, `searchConfigurations`
    - Implement `updateConfiguration`, `deleteConfiguration`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 11.2 Write property test for configuration label required
    - **Property 11: Configuration Label Required**
    - **Validates: Requirements 6.1**

  - [ ]* 11.3 Write property test for full configuration round-trip
    - **Property 12: Full Configuration Round-Trip**
    - **Validates: Requirements 6.2, 6.5**

  - [ ]* 11.4 Write property test for configuration listing completeness
    - **Property 13: Configuration Listing Completeness**
    - **Validates: Requirements 6.3**

  - [ ]* 11.5 Write property test for configuration search filtering
    - **Property 14: Configuration Search Filtering**
    - **Validates: Requirements 6.4**

  - [ ]* 11.6 Write property test for configuration deletion
    - **Property 15: Configuration Deletion**
    - **Validates: Requirements 6.6**

- [x] 12. Implement Airflow Export
  - [x] 12.1 Create Airflow export functionality
    - Implement `exportForAirflow` to serialize configuration to JSON
    - Ensure JSON schema matches Airflow DAG expectations
    - _Requirements: 6.7_

  - [ ]* 12.2 Write property test for Airflow export serialization round-trip
    - **Property 16: Airflow Export Serialization Round-Trip**
    - **Validates: Requirements 6.7**

- [x] 13. Final checkpoint - All services complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use fast-check library for TypeScript
- Unit tests validate specific examples and edge cases
