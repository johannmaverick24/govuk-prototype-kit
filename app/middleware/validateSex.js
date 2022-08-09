


function validateSex(req, res) {
  let prevValues = null;

  if (req.session.data.sex) {
    prevValues = { sex: req.session.data.sex };
  }

  if (req.headers.referer.includes('date-of-birth')) {
    // This is a workaround to prevent the probme created by the fact that date of birth page makes a post request to this endpoint
    res.render('citizen-application/sex', {cache: prevValues, validation: null });
  } else if (req.body['sex']) {
    req.session.data.sex = req.body['sex'];
    res.redirect('national-insurance-number');
  } else {
    res.render('citizen-application/sex', { cache: prevValues, validation: {
      sex: "Please select your birth given sex"
    } });
  }
}



exports.validateSex = validateSex;