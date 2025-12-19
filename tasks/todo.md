# Income Probe - UI Redesign Plan

## Problem Statement
The current UI doesn't match the actual Nu Skin qualification requirements. We need to rebuild it to track:
1. 6 Brand Rep Organizations (name + volume for each)
2. Direct Consumer Volume qualification (250 points)
3. Brand Rep burden (30,000 points)
4. Blue Diamond qualification with 3 leadership legs (40k, 30k, 10k)

## Requirements Breakdown

### Qualification 1: Direct Consumer Volume
- **Target**: 250 points
- **Input**: Current volume on agreement
- **Output**: Gap amount, cost to fill gap

### Qualification 2: Brand Rep Burden
- **Target**: 30,000 points
- **Input**: Current volume
- **Output**: Gap amount, cost to fill gap

### Qualification 3: 6 Brand Rep Organizations
- **Target**: 6 organizations, each with a Brand Rep qualified in them
- **Input**: For each of 6 orgs:
  - Organization name
  - Current volume
- **Output**: For each org:
  - Gap amount (if short)
  - Cost to fill gap
- **Note**: These are first-level brand representatives

### Qualification 4: Blue Diamond Leadership Legs
- **Target**: 3 leadership legs
  - Leg 1: 40,000 points
  - Leg 2: 30,000 points
  - Leg 3: 10,000 points
- **Input**: Current volume for each leg
- **Output**: Gap for each leg, cost to fill gaps

## Implementation Plan

### Task 1: Update Type Definitions
- [ ] Create new types for:
  - BrandRepOrg (name, currentVolume)
  - LeadershipLeg (id, name, targetVolume, currentVolume)
  - QualificationStatus (type, target, current, gap, costToFill)
- [ ] Update types.ts file

### Task 2: Rewrite Calculator Hook
- [ ] Create new calculator hook: `useNuSkinQualification.ts`
- [ ] Calculate gaps for:
  - Direct Consumer (250 points)
  - Brand Rep Burden (30,000 points)
  - Each of 6 Brand Rep Orgs (individual gaps)
  - Each of 3 Leadership Legs (40k, 30k, 10k)
- [ ] Use existing product recommendation logic (best price-per-SV)
- [ ] Return shopping cart recommendations for each gap
- [ ] Calculate total costs

### Task 3: Redesign Dashboard UI
- [ ] Create clear sections for each qualification:
  - Section 1: Direct Consumer Volume (250 pts)
  - Section 2: Brand Rep Burden (30,000 pts)
  - Section 3: 6 Brand Rep Organizations (table/list with name + volume inputs)
  - Section 4: Blue Diamond Leadership Legs (3 legs: 40k, 30k, 10k)
- [ ] Add input fields for all required data
- [ ] Show gap calculations and costs for each section
- [ ] Display shopping cart recommendations
- [ ] Show overall qualification status

### Task 4: Update App Component
- [ ] Remove old console.logs
- [ ] Ensure clean integration

### Task 5: Testing & Review
- [ ] Verify all calculations are correct
- [ ] Test UI with sample data
- [ ] Ensure all inputs are clear and functional

## Technical Notes
- Keep using existing products.json for recommendations
- Use CV (Consumer Volume) points, not SV (Sales Volume) for calculations
- Maintain tax rate calculation
- Keep ROI calculation if applicable

## Review Section
_To be filled after implementation_

