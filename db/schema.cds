namespace DonorMgmt;

using
{
    cuid,
    managed
}
from '@sap/cds/common';

entity Donors : cuid, managed
{
    name : String(100)
        @mandatory;
    email : String(100);
    phone : String(15);
    status : String(20);
    donorType : String(50);
    isRecurringDonor : Boolean;
    isHNI : Boolean;
    summary : String(500);
    nextstep : String(200);
    donations : Association to many Donations on donations.donor = $self;
}

annotate Donors with @assert.unique :
{
    name : [ name ],
};

entity Donations : cuid, managed
{
    donorName : String(100);
    donorEmail : String(100);
    donorPhone : String(15);
    city : String(50);
    amount : Integer;
    currencyCode : String(10);
    donationDate : Date;
    cause : String(100);
    campaign : String(100);
    donor : Association to one Donors;
}
