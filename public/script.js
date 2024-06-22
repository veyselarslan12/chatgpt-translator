const textInput = document.querySelector('#userInput')
const targetLanguageInput = document.querySelector('#targetLanguage')
const translateBtn = document.querySelector('#translateBtn')
const resultDiv = document.querySelector('#result')

translateBtn.addEventListener('click', async () => {
    const text = textInput.value
    const targetLanguage = targetLanguageInput.value

    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, targetLanguage })
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        resultDiv.innerHTML = `<p>Translated Text: ${data.result}</p>`

    } catch (error) {
        console.log(error)
    }
})