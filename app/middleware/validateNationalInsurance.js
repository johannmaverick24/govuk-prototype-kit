const { trimDataValuesAndRemoveSpaces, savePageData, loadPageData } = require('./utilsMiddleware');

const REGEX_NINO = new RegExp(/^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D]{1}$/, 'i');


function validateNationalInsurance(req, res, _next) {
  
  const state = trimDataValuesAndRemoveSpaces(req.body);

  savePageData(req, state);

  const inputCache = loadPageData(req);

  let redirectPath = 'drivers-licence';

  if (req.query && req.query.change) {
    redirectPath = 'review-application';
  }
 
  if (state['has-national-insurance-number'] && state['has-national-insurance-number'] === 'yes') {
    if (REGEX_NINO.test(state['referred-nino-input'])) {
      req.session.data["national-insurance-number"] = state['referred-nino-input'];
      res.redirect(redirectPath);
    } else {
      res.render('citizen-application/national-insurance-number', { 
        cache: inputCache, 
        validation: {  'referred-nino-input': 'Enter a National Insurance number in the correct format'  }
      });
    }
  } else if (state['has-national-insurance-number'] === 'no') {
    req.session.data['has-national-insurance-number'] = 'no';
    res.redirect(redirectPath);
  } else {
    res.render('citizen-application/national-insurance-number', {
      cache: inputCache,
      validation: {
        'has-national-insurance-number': 'Please select whether you have a UK National Insurance number'
      }});
  }
}


exports.validateNationalInsurance = validateNationalInsurance;
