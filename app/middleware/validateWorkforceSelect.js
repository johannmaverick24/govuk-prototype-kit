const { savePageData, loadPageData } = require('./utilsMiddleware');

const cms = {
  generalContent: {
      continue: "Continue",
  }
};

function validateWorkforceSelect(req, res){
  savePageData(req, req.body);
  const inputCache = loadPageData(req);

  let validation = null;

  if (!req.body['radio-group-workforce-select']) {

    validation = {
      'radio-group-workforce-select': 'Select the relevant workforce'
    }

    res.render('registered-body/enhanced/workforce-select',  { cms, cache: inputCache, validation: validation });
  } else {
    req.session.data['workforce-selected'] = req.body['radio-group-workforce-select'];
    res.redirect('/registered-body/position');
  }

}

exports.validateWorkforceSelect = validateWorkforceSelect;
