# `controller/`

Most of the frontend logic lives here. The controllers export functions that match the
`function(req, res, next) { /* do stuff */ }` signature. Those functions are then wired into
the express application via the corresponding router setup in `routes/`.