<a name="1.0.0-alpha.1"></a>
# [1.0.0-alpha.1]() ({date})

### Known Issues
**Entries application > Refine popup:** The refine popup contains 4 calendar components.
1. When the user click on a calendar component, a visual calendar is shown which is also a popup.
The component is part of [PrimeNG suite](primefaces.org/primeng/). We use version 1.0.1 which doesn't handle a nested popup correctly. At the moment, the calendar is exceed the boundary of the 'Refine popup' and is shown partially.
We reported this bug in the [following issue](https://github.com/primefaces/primeng/issues/1833) and waiting for their response to better understand how to solve this issue.
2. Refine > Time Scheduling has peformance issue when opening for the first time:
This happens due to a performance issue with the PrimeNG calendar component. Already fiex by PrimeNG and will be solve with the next version of PRimeNG.

### Features

### Bug Fixes



### BREAKING CHANGES

### DEPRECATION


