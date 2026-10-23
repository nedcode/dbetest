const {test,expect}=require('@playwright/test');
const {reset,login,api}=require('./helpers');
test.beforeEach(async({request})=>reset(request));
async function signIn(page,email='alice@example.test',password='demo-pass'){
 await page.goto('/');
 await page.getByLabel('Email').fill(email);
 await page.getByLabel('Password').fill(password);
 await page.getByRole('button',{name:'Sign in'}).click();
}
test('UI E2E: traveler signs in, reserves, pays, receives ticket notification',async({page})=>{
 await signIn(page);
 await expect(page.getByRole('heading',{name:'Welcome, Alice Demo'})).toBeVisible();
 const journey=page.getByRole('article',{name:'Berlin to Hamburg'});
 await expect(journey).toContainText('49,00');
 await journey.getByRole('button',{name:'Book journey'}).click();
 const booking=page.getByRole('article',{name:'Reservation Berlin → Hamburg'});
 await expect(booking).toContainText('PENDING_PAYMENT');
 await booking.getByRole('button',{name:'Pay (demo approved)'}).click();
 await expect(booking).toContainText('TICKET_ISSUED');
 await expect(booking).toContainText('TKT-');
 await expect(page.getByLabel('Notifications')).toContainText('Your demo ticket');
});
test('UI negative: invalid credentials show accessible alert',async({page})=>{
 await signIn(page,'alice@example.test','wrong-password');
 await expect(page.getByRole('alert')).toContainText('INVALID_CREDENTIALS');
 await expect(page.getByRole('heading',{name:/Sign in/})).toBeVisible();
});
test('UI negative: declined demo payment shows error and keeps reservation pending',async({page})=>{
 await signIn(page);const journey=page.getByRole('article',{name:'Berlin to Leipzig'});
 await journey.getByRole('button',{name:'Book journey'}).click();
 const booking=page.getByRole('article',{name:'Reservation Berlin → Leipzig'});
 await booking.getByRole('button',{name:'Pay (demo declined)'}).click();
 await expect(page.getByRole('alert')).toContainText('PAYMENT_DECLINED');
 await expect(booking).toContainText('PENDING_PAYMENT');
});
test('UI RBAC: support can review bookings but cannot book seats',async({page,request})=>{
 const alice=await login(request);await api(request,alice,'POST','/bookings',{journeyId:'R-101'});
 await signIn(page,'support@example.test');
 await expect(page.getByText('support',{exact:true})).toBeVisible();
 await expect(page.getByRole('article',{name:'Reservation Berlin → Hamburg'})).toContainText('PENDING_PAYMENT');
 await expect(page.getByRole('article',{name:'Berlin to Hamburg'}).getByRole('button',{name:'Book journey'})).toBeDisabled();
});
test('UI inventory: sold-out journey cannot be booked',async({page,request})=>{
 const alice=await login(request);
 for(let i=0;i<2;i++)await api(request,alice,'POST','/bookings',{journeyId:'R-101'});
 await signIn(page);
 const journey=page.getByRole('article',{name:'Berlin to Hamburg'});
 await expect(journey).toContainText('0 seats available');
 await expect(journey.getByRole('button',{name:'Sold out'})).toBeDisabled();
});
