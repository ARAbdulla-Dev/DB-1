/*
---------------------------------------------
© EuroLanka Travel 2024. All Rights Reserved.
---------------------------------------------
*/

document.getElementById('one').onclick = function() {
    

    // Show the overlay
    document.querySelector('.overlay').style.display = 'block';

    // Show the popup
    document.querySelector('.popup').style.display = 'block';
};

document.querySelector('.close').onclick = function(){
   

    // Show the overlay
    document.querySelector('.overlay').style.display = 'none';

    // Show the popup
    document.querySelector('.popup').style.display = 'none';
}
