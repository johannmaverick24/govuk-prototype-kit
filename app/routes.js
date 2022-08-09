const express = require('express')
const router = express.Router()

// middleware import
const { validateSex } = require('./middleware/validateSex');
const { validateNationalInsurance } = require('./middleware/validateNationalInsurance');
const { validateApplicationDetailsConfirm } = require('./middleware/validateApplicationDetailsConfirm');
const { validateWorkforceSelect } = require('./middleware/validateWorkforceSelect');
const { invalidateCache, loadPageData, savePageData } = require('./middleware/utilsMiddleware');

const cms = {
    generalContent: {
        continue: "Continue",
    }
};

// Add your routes here - above the module.exports line
router.get('/start', (req, res) => {
   res.render('start');
});

router.get('/test', (req, res) => {
    res.render('test');
});

router.get('/list-accounts', (req, res, _next) => {
    if (!req.session?.mockDBaccounts) {
        generateAccounts(req, false);
    }
    res.render('list-accounts', { accounts: req.session?.mockDBaccounts });
});

router.get('/enter-certificate', (req, res, _next) => {
    res.render('dashboard/enter-certificate');
});

router.post('/dashboard/enter-certificate', (req, res, _next) => {
    const dbsCertificateNumber = req.body['dbs-certificate-nr'];
    savePageData(req, req.body);
    const inputCache = loadPageData(req);
    const dataValidation = {};
    let selectedCertificate = undefined;

    if (!dbsCertificateNumber) {
        dataValidation['dbs-certificate-nr'] = 'Enter certificate number';
    }

    if(dbsCertificateNumber.length !==  12 || dbsCertificateNumber.slice(0, 2) !== "00" || /^[0-9]+$/.test(dbsCertificateNumber) === false){
        dataValidation['dbs-certificate-nr'] = 'Enter valid certificate number';
    }

    if (dbsCertificateNumber) {
        if (req.session?.mockDBaccounts) {
            selectedCertificate = req.session?.mockDBaccounts.find((el) => dbsCertificateNumber === el.certificateNumber );
            if(selectedCertificate){
                req.session.selectedCertificate = selectedCertificate;
            } else {
                dataValidation['dbs-certificate-nr'] = 'Enter valid certificate number';
            }
           
        }
        
    }
    
    
    if (Object.keys(dataValidation).length) {
        res.render('dashboard/enter-certificate', { cache: inputCache,   validation: dataValidation });
    } else {
        res.redirect('/dashboard/request-otp');
    }
});

router.get('/dashboard/request-otp', (req, res, _next) => {
    let backButton = '/dashboard/enter-certificate';
    res.render('dashboard/request-otp', { backButton: backButton, cache: null, phoneNumber: req.session?.selectedCertificate?.phoneNumber || '',  validation: null });
});

router.post('/dashboard/request-otp', (req, res, _next) => {
    res.redirect('/dashboard/enter-otp');
});

router.get('/dashboard/enter-otp', (req, res, _next) => {
    let backButton = '/dashboard/request-otp';
    req.session.selectedCertificate.otpCode = Math.floor(Math.random() * 999999);
    console.log('OTP', req.session.selectedCertificate)
    res.render('dashboard/enter-otp', { backButton: backButton, phoneNumber: req.session?.selectedCertificate?.phoneNumber || '',  validation: null });
});

router.post('/dashboard/enter-otp', (req, res, _next) => {
    let otpCode = req.body['otp-code'];
    const dataValidation = {};

    if(!otpCode) {
        dataValidation['otp-code'] = 'Enter security code';
    } 

    if(otpCode != req.session.selectedCertificate.otpCode) {
        dataValidation['otp-code'] = 'Incorrect security code';
    }

    if (Object.keys(dataValidation).length) {
        res.render('dashboard/enter-otp', { backButton: '/dashboard/request-otp', validation: dataValidation });
    } else {
        res.send("SUCCESS")
    }
});
 

// Clear all data in session if you open /prototype-admin/clear-data
router.post('/prototype-admin/clear-data', function (req, res) {
    req.session.data = {};
    req.session.cache = {};
    generateAccounts(req, true);
    console.log("Mock Accounts:", req.session.mockDBaccounts)
    res.redirect('/start');
});


const generateAccounts = (req, refresh) => {
    if (!req.session?.mockDBaccounts) {
        const accounts = [];

        for (let i = 1; i <= 3; i++) {
            accounts.push({
                certificateNumber: "00" + String(1111111111 + i),
                phoneNumber: "0712312300" + String(i),
            });
        }
        req.session.mockDBaccounts = accounts;
    } else if (req.session.mockDBaccounts && refresh) {
        delete req.session.mockDBaccounts;
        generateAccounts(req, false);
    }
}
module.exports = router

