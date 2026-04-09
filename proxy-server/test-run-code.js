import axios from 'axios';

const API_URL = 'http://localhost:8001/run-code';

async function testLanguage(language, code) {
    console.log(`Testing ${language}...`);
    try {
        const response = await axios.post(API_URL, { language, code });
        console.log(`Result:`, response.data);
    } catch (error) {
        console.error(`Error testing ${language}:`, error.response?.data || error.message);
    }
    console.log('-------------------');
}

async function runTests() {
    // Python
    await testLanguage('python', 'print("Hello from Python!")');

    // C
    await testLanguage('c', '#include <stdio.h>\nint main() { printf("Hello from C!\\n"); return 0; }');

    // C++
    await testLanguage('cpp', '#include <iostream>\nint main() { std::cout << "Hello from C++!" << std::endl; return 0; }');

    // Java
    await testLanguage('java', 'public class Main { public static void main(String[] args) { System.out.println("Hello from Java!"); } }');

    // Timeout Test
    await testLanguage('python', 'import time\nwhile True: time.sleep(1)');
}

runTests();
