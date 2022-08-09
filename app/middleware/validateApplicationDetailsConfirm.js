
const validateApplicationDetailsConfirm = (req, res) => {

  const currentSelection = req.session.data.selectedApplicationToCancel;

if (req.body['confirmCancel'] === 'cancel') {
    req.session.data.applications.forEach((el) => {
      if (el.ref === currentSelection.ref) {
        el.status = 'Cancelled';
      }
    });
  
    req.session.data.selectedApplicationToCancel = undefined;
  }
  res.redirect('/dashboard/home');

}

exports.validateApplicationDetailsConfirm = validateApplicationDetailsConfirm;
