# Test inventory

| Suite | Count | Scope | CI |
|---|---:|---|---|
| 01 public homepage | 1 | External public UI | Yes |
| 02 Daniel | 1 | Private live session | No |
| 03 negative login | 2 | External live login | No |
| 04 calendar | 1 | Private live session | No |
| 05 API | 9 | Local mock API | Yes |
| 06 domain | 27 | Local domain functions | Yes |
| 07 API boundaries | 17 | Local mock API | Yes |
| 08 accessibility | 2 | External public UI | Yes |
| 09 AI evaluation | 5 | Offline reference oracle | Yes |
| **Total** | **65** | Mixed; do not equate mock coverage with DBE production | **61 CI** |

Counts are derived from explicit test definitions. No real AI model is invoked. No live DBE security scanning is performed.
