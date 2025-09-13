// Test script cho API thi thật mới
const fetch = require('node-fetch');

async function testOfficialExamAPI() {
  console.log('🧪 Testing Official Exam API...\n');
  
  try {
    // Test API mới
    const response = await fetch('http://localhost:5000/api/questions/official');
    const questions = await response.json();
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Number of questions:', questions.length);
    console.log('🎯 Expected: 20 questions\n');
    
    if (questions.length === 20) {
      console.log('✅ PASS: Đúng 20 câu hỏi');
    } else {
      console.log('❌ FAIL: Không đúng 20 câu hỏi');
    }
    
    // Kiểm tra cấu trúc câu hỏi
    if (questions.length > 0) {
      const firstQuestion = questions[0];
      console.log('\n📝 Sample question structure:');
      console.log('- ID:', firstQuestion.Id);
      console.log('- Question:', firstQuestion.QuestionText?.substring(0, 50) + '...');
      console.log('- Option A:', firstQuestion.OptionA?.substring(0, 30) + '...');
      console.log('- Option B:', firstQuestion.OptionB?.substring(0, 30) + '...');
      console.log('- Option C:', firstQuestion.OptionC?.substring(0, 30) + '...');
      console.log('- Option D:', firstQuestion.OptionD?.substring(0, 30) + '...');
      console.log('- Correct Answer:', firstQuestion.CorrectAnswer);
      console.log('- Original Correct Answer:', firstQuestion.OriginalCorrectAnswer);
      console.log('- Is Critical:', firstQuestion.IsCritical);
    }
    
    // Kiểm tra random options
    console.log('\n🎲 Checking random options...');
    const hasRandomOptions = questions.some(q => q.OriginalCorrectAnswer && q.OriginalCorrectAnswer !== q.CorrectAnswer);
    if (hasRandomOptions) {
      console.log('✅ PASS: Options được random thành công');
    } else {
      console.log('⚠️  WARNING: Có thể options chưa được random (cần test nhiều lần)');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Chạy test
testOfficialExamAPI();

