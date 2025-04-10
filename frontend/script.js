document.addEventListener('DOMContentLoaded', function() {
    const questions = [
        "Held hands romantically?",
        "Been on a date?",
        "Been in a relationship?",
        "Danced with someone romantically?",
        "Kissed someone on the cheek?",
        "Kissed someone on the lips?",
        "Made out with someone?",
        "Been to a Rutgers football game?",
        "Attended a frat party?",
        "Been to the Yard on College Ave?",
        "Used the Rutgers bus system?",
        "Fallen asleep on a Rutgers bus?",
        "Missed a stop on the Rutgers bus?",
        "Had to run after a Rutgers bus?",
        "Complained about the Rutgers bus app?",
        "Been to a Rutgers basketball game?",
        "Attended Rutgersfest/Rutgers Day?",
        "Pulled an all-nighter at Alexander Library?",
        "Studied at the Honors College?",
        "Been to a dance marathon?",
        "Walked from College Ave to Busch Campus?",
        "Attended a protest at Rutgers?",
        "Been to the Livingston dining hall?",
        "Had a meal at Brower Commons?",
        "Taken a photo with the Rutgers statue?",
        "Gone fat sandwich hopping?",
        "Eaten a fat sandwich at 2 AM?",
        "Attended office hours?",
        "Called the wrong professor 'professor'?",
        "Skipped class to sleep in?",
        "Failed a college exam?",
        "Cheated on a college exam?",
        "Pulled an all-nighter to finish an assignment?",
        "Submitted an assignment one minute before the deadline?",
        "Fallen asleep in class?",
        "Used a fake ID?",
        "Drank alcohol?",
        "Been drunk?",
        "Played beer pong?",
        "Done a keg stand?",
        "Blacked out from drinking?",
        "Thrown up from drinking?",
        "Pregamed before class?",
        "Gone to class hungover?",
        "Smoked marijuana?",
        "Used other recreational drugs?",
        "Visited The Yard during finals week?",
        "Gone to a party on Easton Ave?",
        "Been to New Brunswick after midnight?",
        "Had a random roommate?",
        "Had a roommate conflict?",
        "Lived in a dorm?",
        "Lived off-campus?",
        "Been to Rutgers Gardens?",
        "Been inside Kirkpatrick Chapel?",
        "Studied in the College Ave Student Center?",
        "Hung out at Hidden Grounds?",
        "Been to a Rutgers theater production?",
        "Joined a Rutgers club?",
        "Been an officer in a Rutgers organization?",
        "Had a job on campus?",
        "Been a TA or tutor?",
        "Taken a class that wasn't in your major?",
        "Changed your major?",
        "Transferred to Rutgers from another school?",
        "Participated in research?",
        "Presented at a conference?",
        "Published a paper?",
        "Done an internship?",
        "Studied abroad?",
        "Made a friend from another country?",
        "Spoken in class?",
        "Given a class presentation?",
        "Fallen asleep in the library?",
        "Used the Rutgers gym?",
        "Attended a Rutgers fitness class?",
        "Gone swimming at the Rutgers pool?",
        "Played an intramural sport?",
        "Sneaked into a Rutgers event?",
        "Been to a Rutgers career fair?",
        "Had an interview on campus?",
        "Received a job offer while at Rutgers?",
        "Registered for classes late?",
        "Been wait-listed for a class?",
        "Crashed a class you weren't registered for?",
        "Taken summer classes?",
        "Taken online classes?",
        "Used rate my professor to choose classes?",
        "Gotten a parking ticket on campus?",
        "Parked illegally on campus?",
        "Missed the Rutgers bus and been late to class?",
        "Complained about tuition/fees?",
        "Applied for financial aid?",
        "Received a scholarship?",
        "Worked while studying full-time?",
        "Pulled an all-nighter during finals week?",
        "Stayed at Rutgers during a holiday break?",
        "Attended a Rutgers alumni event?",
        "Worn Rutgers merch?",
        "Bought a class ring?",
        "Taken a picture with the Scarlet Knight mascot?",
        "Sang the Rutgers alma mater?",
        "Celebrated Rutgers' birthday?",
        "Went down to the banks of the old Raritan"
    ];

    const questionsContainer = document.querySelector('.questions');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const resultsDiv = document.getElementById('results');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const form = document.getElementById('purityForm');
    const shareTwitterBtn = document.getElementById('shareTwitter');
    const shareFacebookBtn = document.getElementById('shareFacebook');
    const shareInstagramBtn = document.getElementById('shareInstagram');

    // Generate questions
    questions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `q${index + 1}`;
        checkbox.name = `q${index + 1}`;
        
        const label = document.createElement('label');
        label.htmlFor = `q${index + 1}`;
        label.textContent = `${index + 1}. ${question}`;
        
        questionItem.appendChild(checkbox);
        questionItem.appendChild(label);
        questionsContainer.appendChild(questionItem);
    });

    // Calculate score and show results
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Count unchecked boxes (things you haven't done)
        const checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
        const score = 100 - checkedCount;
        
        // Display score
        scoreDisplay.textContent = score;
        resultsDiv.classList.remove('hidden');
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Send data to server
        sendDataToServer(score, getCheckedItems());
    });

    // Get array of checked items
    function getCheckedItems() {
        const checkedItems = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach((checkbox, index) => {
            checkedItems.push(checkbox.id.replace('q', ''));
        });
        return checkedItems;
    }

    // Send data to server
    function sendDataToServer(score, checkedItems) {
        fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: score,
                selections: checkedItems,
                timestamp: new Date().toISOString()
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Reset form
    resetBtn.addEventListener('click', function() {
        form.reset();
        resultsDiv.classList.add('hidden');
    });

    // Retake test
    retakeBtn.addEventListener('click', function() {
        form.reset();
        resultsDiv.classList.add('hidden');
        window.scrollTo(0, 0);
    });

    // Social sharing
    shareTwitterBtn.addEventListener('click', function() {
        const score = scoreDisplay.textContent;
        const shareText = `I scored ${score}/100 on the Rutgers Purity Test! How pure are you?`;
        const shareUrl = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });

    shareFacebookBtn.addEventListener('click', function() {
        const shareUrl = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });

    shareInstagramBtn.addEventListener('click', function() {
        alert('To share on Instagram, take a screenshot of your score and post it to your story or feed!');
    });
}); 