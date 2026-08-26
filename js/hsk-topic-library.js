/* PandaHán Pro — curated Offline HSK 1–3 topic library.
   Each item is a selected, level-bounded practice theme; it is not a claim of
   free-form AI generation. The chat router can use this library without a network. */
(() => {
  "use strict";
  const items = [
    {
      id: "hsk1_self_intro", level: 1, topicVi: "Giới thiệu bản thân", topicEn: "Introducing myself", triggers: ["self introduction", "introduce myself", "myself", "giới thiệu", "bản thân"],
      zh: "我叫林安。我是学生，今年十八岁。我学习汉语，也喜欢听音乐。很高兴认识你！",
      pinyin: "Wǒ jiào Lín Ān. Wǒ shì xuéshēng, jīnnián shíbā suì. Wǒ xuéxí Hànyǔ, yě xǐhuan tīng yīnyuè. Hěn gāoxìng rènshi nǐ!",
      vi: "Tôi tên là Lâm An. Tôi là học sinh, năm nay 18 tuổi. Tôi học tiếng Trung và cũng thích nghe nhạc. Rất vui được gặp bạn!",
      en: "My name is Lin An. I am a student and I am eighteen this year. I study Chinese and also enjoy listening to music. Nice to meet you!",
      vocabulary: ["叫 jiào — be called", "学生 xuéshēng — student", "喜欢 xǐhuan — like", "认识 rènshi — know / meet"],
      grammar: ["A 叫 B", "A 是 B", "也 = also", "很 + adjective"],
      dialogue: ["A: 你叫什么名字？ Nǐ jiào shénme míngzi? — What is your name?", "B: 我叫林安。很高兴认识你。 Wǒ jiào Lín Ān. Hěn gāoxìng rènshi nǐ. — My name is Lin An. Nice to meet you."],
      taskVi: "Đổi tên, tuổi và sở thích thành thông tin của bạn rồi viết lại 4–5 câu.", taskEn: "Replace the name, age and hobby with your own information, then write 4–5 sentences."
    },
    {
      id: "hsk1_family", level: 1, topicVi: "Gia đình", topicEn: "My family", triggers: ["family", "my family", "gia đình", "ba mẹ", "bố mẹ"],
      zh: "我家有四个人：爸爸、妈妈、姐姐和我。爸爸是老师，妈妈在医院工作。我们晚上常常一起吃饭，也一起看电视。",
      pinyin: "Wǒ jiā yǒu sì ge rén: bàba, māma, jiějie hé wǒ. Bàba shì lǎoshī, māma zài yīyuàn gōngzuò. Wǒmen wǎnshang chángcháng yìqǐ chīfàn, yě yìqǐ kàn diànshì.",
      vi: "Nhà tôi có bốn người: bố, mẹ, chị gái và tôi. Bố là giáo viên, mẹ làm việc ở bệnh viện. Buổi tối chúng tôi thường ăn cơm và xem tivi cùng nhau.",
      en: "There are four people in my family: my father, mother, older sister and me. My father is a teacher and my mother works at a hospital. In the evening we often eat and watch TV together.",
      vocabulary: ["家 jiā — family/home", "医院 yīyuàn — hospital", "常常 chángcháng — often", "一起 yìqǐ — together"],
      grammar: ["有 + number + measure word + noun", "在 + place + verb", "和 = and", "常常 + verb"],
      dialogue: ["A: 你家有几个人？ Nǐ jiā yǒu jǐ ge rén? — How many people are in your family?", "B: 我家有四个人。 Wǒ jiā yǒu sì ge rén. — There are four people in my family."],
      taskVi: "Viết về 3–4 người trong gia đình bạn và một hoạt động cả nhà cùng làm.", taskEn: "Write about 3–4 members of your family and one activity you do together."
    },
    {
      id: "hsk1_school_day", level: 1, topicVi: "Một ngày ở trường", topicEn: "A day at school", triggers: ["school", "school day", "class", "trường", "lớp học", "đi học"],
      zh: "我每天七点去学校。上午我有汉语课和英语课。中午我和朋友在学校吃饭。下午四点，我坐公共汽车回家。",
      pinyin: "Wǒ měitiān qī diǎn qù xuéxiào. Shàngwǔ wǒ yǒu Hànyǔ kè hé Yīngyǔ kè. Zhōngwǔ wǒ hé péngyou zài xuéxiào chīfàn. Xiàwǔ sì diǎn, wǒ zuò gōnggòng qìchē huí jiā.",
      vi: "Mỗi ngày tôi đến trường lúc 7 giờ. Buổi sáng tôi có lớp tiếng Trung và tiếng Anh. Buổi trưa tôi ăn ở trường với bạn. 4 giờ chiều tôi đi xe buýt về nhà.",
      en: "Every day I go to school at seven. In the morning I have Chinese and English classes. At noon I eat at school with friends. At four in the afternoon, I take the bus home.",
      vocabulary: ["每天 měitiān — every day", "上午 shàngwǔ — morning", "中午 zhōngwǔ — noon", "公共汽车 gōnggòng qìchē — bus"],
      grammar: ["time + verb", "有 + class", "和 + person", "坐 + transport"],
      dialogue: ["A: 你几点去学校？ Nǐ jǐ diǎn qù xuéxiào? — What time do you go to school?", "B: 我七点去学校。 Wǒ qī diǎn qù xuéxiào. — I go at seven."],
      taskVi: "Đổi giờ giấc và môn học để viết lịch một ngày của bạn.", taskEn: "Change the times and subjects to write your own daily schedule."
    },
    {
      id: "hsk1_shopping", level: 1, topicVi: "Mua trái cây", topicEn: "Buying fruit", triggers: ["shopping", "buy fruit", "market", "mua", "chợ", "trái cây"],
      zh: "今天下午我去商店买水果。我想买苹果和香蕉。苹果一斤十块钱，香蕉很便宜。我买了两斤苹果和一斤香蕉。",
      pinyin: "Jīntiān xiàwǔ wǒ qù shāngdiàn mǎi shuǐguǒ. Wǒ xiǎng mǎi píngguǒ hé xiāngjiāo. Píngguǒ yì jīn shí kuài qián, xiāngjiāo hěn piányi. Wǒ mǎi le liǎng jīn píngguǒ hé yì jīn xiāngjiāo.",
      vi: "Chiều nay tôi đi cửa hàng mua trái cây. Tôi muốn mua táo và chuối. Táo 10 tệ một cân, chuối rất rẻ. Tôi đã mua hai cân táo và một cân chuối.",
      en: "This afternoon I went to the shop to buy fruit. I wanted apples and bananas. Apples are ten yuan per jin, and bananas are cheap. I bought two jin of apples and one jin of bananas.",
      vocabulary: ["商店 shāngdiàn — shop", "水果 shuǐguǒ — fruit", "便宜 piányi — cheap", "斤 jīn — half-kilogram"],
      grammar: ["想 + verb", "quantity + measure word + noun", "很 + adjective", "了 for completed action"],
      dialogue: ["A: 这个苹果多少钱？ Zhège píngguǒ duōshao qián? — How much are these apples?", "B: 一斤十块钱。 Yì jīn shí kuài qián. — Ten yuan per jin."],
      taskVi: "Đổi loại hàng, số lượng và giá để tạo đoạn mua sắm của bạn.", taskEn: "Change the item, quantity and price to create your own shopping paragraph."
    },
    {
      id: "hsk2_weekend", level: 2, topicVi: "Cuối tuần", topicEn: "My weekend", triggers: ["weekend", "last weekend", "cuối tuần", "chủ nhật", "thứ bảy"],
      zh: "上个周末，我本来想在家休息，但是朋友邀请我去公园。因为天气很好，所以我们骑自行车去。我们拍了很多照片，晚上还一起吃了饭。",
      pinyin: "Shàng ge zhōumò, wǒ běnlái xiǎng zài jiā xiūxi, dànshì péngyou yāoqǐng wǒ qù gōngyuán. Yīnwèi tiānqì hěn hǎo, suǒyǐ wǒmen qí zìxíngchē qù. Wǒmen pāi le hěn duō zhàopiàn, wǎnshang hái yìqǐ chī le fàn.",
      vi: "Cuối tuần trước, vốn tôi muốn nghỉ ở nhà nhưng bạn mời tôi đi công viên. Vì thời tiết đẹp nên chúng tôi đi xe đạp. Chúng tôi chụp nhiều ảnh và tối còn ăn cơm cùng nhau.",
      en: "Last weekend, I had planned to rest at home, but a friend invited me to the park. Because the weather was good, we cycled there. We took many photos and also ate together that evening.",
      vocabulary: ["本来 běnlái — originally", "邀请 yāoqǐng — invite", "自行车 zìxíngchē — bicycle", "照片 zhàopiàn — photo"],
      grammar: ["本来…但是…", "因为…所以…", "还 = in addition", "verb + 了"],
      dialogue: ["A: 你周末做什么了？ Nǐ zhōumò zuò shénme le? — What did you do at the weekend?", "B: 我跟朋友去公园了。 Wǒ gēn péngyou qù gōngyuán le. — I went to the park with a friend."],
      taskVi: "Viết 5–6 câu về cuối tuần của bạn, dùng 因为…所以… ít nhất một lần.", taskEn: "Write 5–6 sentences about your weekend and use 因为…所以… at least once."
    },
    {
      id: "hsk2_food", level: 2, topicVi: "Món ăn yêu thích", topicEn: "My favourite food", triggers: ["food", "favourite food", "restaurant", "món ăn", "nhà hàng", "đồ ăn"],
      zh: "我最喜欢吃中国菜，特别是西红柿鸡蛋汤。这个菜做起来不太难，而且很健康。上个星期，我已经学会做这道菜了。",
      pinyin: "Wǒ zuì xǐhuan chī Zhōngguó cài, tèbié shì xīhóngshì jīdàn tāng. Zhège cài zuò qǐlái bú tài nán, érqiě hěn jiànkāng. Shàng ge xīngqī, wǒ yǐjīng xuéhuì zuò zhè dào cài le.",
      vi: "Tôi thích nhất món Trung Quốc, đặc biệt là canh cà chua trứng. Món này làm không quá khó và rất tốt cho sức khỏe. Tuần trước, tôi đã học được cách làm món này.",
      en: "I like Chinese food most, especially tomato-and-egg soup. This dish is not too difficult to make and is healthy. Last week, I learned how to make it.",
      vocabulary: ["特别 tèbié — especially", "健康 jiànkāng — healthy", "已经 yǐjīng — already", "学会 xuéhuì — learn to / master"],
      grammar: ["最 + adjective/verb", "不太 + adjective", "而且 = and also", "已经…了"],
      dialogue: ["A: 你最喜欢吃什么？ Nǐ zuì xǐhuan chī shénme? — What do you like to eat most?", "B: 我最喜欢吃中国菜。 Wǒ zuì xǐhuan chī Zhōngguó cài. — I like Chinese food most."],
      taskVi: "Thay món ăn và mô tả vì sao bạn thích nó bằng 4–5 câu.", taskEn: "Replace the dish and explain why you like it in 4–5 sentences."
    },
    {
      id: "hsk2_travel", level: 2, topicVi: "Chuyến đi ngắn", topicEn: "A short trip", triggers: ["travel", "trip", "holiday", "du lịch", "chuyến đi", "kỳ nghỉ"],
      zh: "下个月我打算和家人去海边旅游。我们先坐火车到那个城市，再坐出租车去酒店。虽然路上可能很累，但是我觉得这次旅行一定很有意思。",
      pinyin: "Xià ge yuè wǒ dǎsuàn hé jiārén qù hǎibiān lǚyóu. Wǒmen xiān zuò huǒchē dào nà ge chéngshì, zài zuò chūzūchē qù jiǔdiàn. Suīrán lùshang kěnéng hěn lèi, dànshì wǒ juéde zhè cì lǚxíng yídìng hěn yǒu yìsi.",
      vi: "Tháng sau tôi dự định đi du lịch biển với gia đình. Chúng tôi sẽ đi tàu đến thành phố đó trước, sau đó đi taxi đến khách sạn. Tuy trên đường có thể mệt nhưng tôi nghĩ chuyến đi này chắc chắn rất thú vị.",
      en: "Next month I plan to travel to the seaside with my family. First we will take a train to that city, then a taxi to the hotel. Although the journey may be tiring, I think this trip will certainly be interesting.",
      vocabulary: ["打算 dǎsuàn — plan", "火车 huǒchē — train", "出租车 chūzūchē — taxi", "一定 yídìng — certainly"],
      grammar: ["打算 + verb", "先…再…", "虽然…但是…", "可能 + adjective"],
      dialogue: ["A: 你打算去哪儿旅游？ Nǐ dǎsuàn qù nǎr lǚyóu? — Where do you plan to travel?", "B: 我打算去海边。 Wǒ dǎsuàn qù hǎibiān. — I plan to go to the seaside."],
      taskVi: "Viết kế hoạch chuyến đi 5–6 câu, dùng 先…再… và 虽然…但是….", taskEn: "Write a 5–6 sentence trip plan using 先…再… and 虽然…但是… ."
    },
    {
      id: "hsk2_doctor", level: 2, topicVi: "Đi khám bệnh", topicEn: "Visiting the doctor", triggers: ["doctor", "sick", "hospital", "bác sĩ", "ốm", "bệnh"],
      zh: "今天早上我觉得不舒服，所以去医院看医生。医生说我应该多喝水，也要好好休息。他给我开了药，还告诉我明天不要去上班。",
      pinyin: "Jīntiān zǎoshang wǒ juéde bù shūfu, suǒyǐ qù yīyuàn kàn yīshēng. Yīshēng shuō wǒ yīnggāi duō hē shuǐ, yě yào hǎohāo xiūxi. Tā gěi wǒ kāi le yào, hái gàosu wǒ míngtiān bú yào qù shàngbān.",
      vi: "Sáng nay tôi thấy không khỏe nên đi bệnh viện khám bác sĩ. Bác sĩ nói tôi nên uống nhiều nước và nghỉ ngơi. Ông ấy kê thuốc và còn bảo ngày mai đừng đi làm.",
      en: "This morning I felt unwell, so I went to the hospital to see a doctor. The doctor said I should drink more water and rest well. He prescribed medicine and also told me not to go to work tomorrow.",
      vocabulary: ["不舒服 bù shūfu — unwell", "应该 yīnggāi — should", "休息 xiūxi — rest", "开药 kāi yào — prescribe medicine"],
      grammar: ["觉得 + adjective", "所以", "应该/要 + verb", "不要 + verb"],
      dialogue: ["A: 你怎么了？ Nǐ zěnme le? — What is wrong?", "B: 我觉得不舒服。 Wǒ juéde bù shūfu. — I feel unwell."],
      taskVi: "Viết đoạn ngắn mô tả triệu chứng và lời khuyên của bác sĩ.", taskEn: "Write a short paragraph describing symptoms and the doctor's advice."
    },
    {
      id: "hsk3_study_plan", level: 3, topicVi: "Kế hoạch học tập", topicEn: "My study plan", triggers: ["study plan", "exam", "learning plan", "kế hoạch học", "thi", "ôn thi"],
      zh: "为了准备下个月的中文考试，我给自己做了一个学习计划。如果每天能按时复习，我相信成绩会提高。除了背新单词以外，我还把常常说错的句子写下来，请老师帮助我修改。",
      pinyin: "Wèile zhǔnbèi xià ge yuè de Zhōngwén kǎoshì, wǒ gěi zìjǐ zuò le yí ge xuéxí jìhuà. Rúguǒ měitiān néng ànshí fùxí, wǒ xiāngxìn chéngjì huì tígāo. Chúle bèi xīn dāncí yǐwài, wǒ hái bǎ chángcháng shuō cuò de jùzi xiě xiàlái, qǐng lǎoshī bāngzhù wǒ xiūgǎi.",
      vi: "Để chuẩn bị cho kỳ thi tiếng Trung tháng sau, tôi lập kế hoạch học. Nếu mỗi ngày có thể ôn đúng giờ, tôi tin điểm sẽ tăng. Ngoài học từ mới, tôi còn viết lại những câu hay nói sai và nhờ giáo viên sửa.",
      en: "To prepare for next month's Chinese exam, I made a study plan. If I can review on time each day, I believe my score will improve. Besides learning new words, I write down sentences I often say incorrectly and ask my teacher to correct them.",
      vocabulary: ["为了 wèile — in order to", "按时 ànshí — on time", "提高 tígāo — improve", "修改 xiūgǎi — revise"],
      grammar: ["为了…", "如果…", "除了…以外，还…", "把 + object + verb", "请 + person + verb"],
      dialogue: ["A: 你为什么要复习？ Nǐ wèishénme yào fùxí? — Why do you need to review?", "B: 为了准备中文考试。 Wèile zhǔnbèi Zhōngwén kǎoshì. — To prepare for the Chinese exam."],
      taskVi: "Viết 6–8 câu về kế hoạch học của bạn và dùng ít nhất hai mẫu HSK3.", taskEn: "Write 6–8 sentences about your study plan using at least two HSK3 patterns."
    },
    {
      id: "hsk3_work", level: 3, topicVi: "Một ngày làm việc", topicEn: "A day at work", triggers: ["work", "job", "office", "công việc", "văn phòng", "đi làm"],
      zh: "我在一家小公司工作已经两年了。虽然工作有时候很忙，但是同事都很愿意帮助我。每天开会以前，我会把需要讨论的问题准备好，这样大家可以更快地作决定。",
      pinyin: "Wǒ zài yì jiā xiǎo gōngsī gōngzuò yǐjīng liǎng nián le. Suīrán gōngzuò yǒushíhou hěn máng, dànshì tóngshì dōu hěn yuànyì bāngzhù wǒ. Měitiān kāihuì yǐqián, wǒ huì bǎ xūyào tǎolùn de wèntí zhǔnbèi hǎo, zhèyàng dàjiā kěyǐ gèng kuài de zuò juédìng.",
      vi: "Tôi đã làm ở một công ty nhỏ hai năm. Dù công việc đôi khi bận nhưng đồng nghiệp đều sẵn lòng giúp tôi. Trước mỗi cuộc họp, tôi chuẩn bị các vấn đề cần thảo luận để mọi người có thể quyết định nhanh hơn.",
      en: "I have worked at a small company for two years. Although work is sometimes busy, my colleagues are willing to help. Before each meeting, I prepare the issues to discuss so everyone can decide more quickly.",
      vocabulary: ["同事 tóngshì — colleague", "愿意 yuànyì — willing", "讨论 tǎolùn — discuss", "决定 juédìng — decision"],
      grammar: ["已经…了", "虽然…但是…", "以前", "把 + object + verb", "这样"],
      dialogue: ["A: 你在哪儿工作？ Nǐ zài nǎr gōngzuò? — Where do you work?", "B: 我在一家小公司工作。 Wǒ zài yì jiā xiǎo gōngsī gōngzuò. — I work at a small company."],
      taskVi: "Mô tả công việc hoặc trường học của bạn trong 6–8 câu và dùng 把 hoặc 这样.", taskEn: "Describe your work or school in 6–8 sentences using 把 or 这样."
    },
    {
      id: "hsk3_city_life", level: 3, topicVi: "Cuộc sống thành phố", topicEn: "City life", triggers: ["city", "city life", "transport", "thành phố", "giao thông", "cuộc sống"],
      zh: "我以前住在一个安静的小城市，现在搬到大城市以后，生活方便多了。地铁和公共汽车都很快，不过上下班的时候人太多。如果周末不下雨，我通常会去公园散步，让自己放松一下。",
      pinyin: "Wǒ yǐqián zhù zài yí ge ānjìng de xiǎo chéngshì, xiànzài bān dào dà chéngshì yǐhòu, shēnghuó fāngbiàn duō le. Dìtiě hé gōnggòng qìchē dōu hěn kuài, búguò shàngxiàbān de shíhou rén tài duō. Rúguǒ zhōumò bù xiàyǔ, wǒ tōngcháng huì qù gōngyuán sànbù, ràng zìjǐ fàngsōng yíxià.",
      vi: "Trước đây tôi sống ở thành phố nhỏ yên tĩnh. Sau khi chuyển đến thành phố lớn, cuộc sống tiện hơn nhiều. Tàu điện ngầm và xe buýt đều nhanh nhưng giờ đi làm rất đông. Nếu cuối tuần không mưa, tôi thường đi dạo công viên để thư giãn.",
      en: "I used to live in a quiet small city. After moving to a big city, life became much more convenient. The subway and buses are fast, but rush hour is crowded. If it does not rain at the weekend, I usually walk in the park to relax.",
      vocabulary: ["搬 bān — move", "方便 fāngbiàn — convenient", "不过 búguò — however", "放松 fàngsōng — relax"],
      grammar: ["以前…现在…", "…以后", "不过", "如果…", "让 + person + verb"],
      dialogue: ["A: 你喜欢住在大城市吗？ Nǐ xǐhuan zhù zài dà chéngshì ma? — Do you like living in a big city?", "B: 生活很方便，不过人很多。 Shēnghuó hěn fāngbiàn, búguò rén hěn duō. — Life is convenient, but there are many people."],
      taskVi: "So sánh nơi bạn sống trước đây và hiện tại bằng 6–8 câu.", taskEn: "Compare where you lived before with where you live now in 6–8 sentences."
    },
    {
      id: "hsk3_environment", level: 3, topicVi: "Bảo vệ môi trường", topicEn: "Protecting the environment", triggers: ["environment", "recycle", "pollution", "môi trường", "rác", "ô nhiễm"],
      zh: "最近我们学校组织了一个保护环境的活动。老师告诉我们，除了少用塑料袋以外，还应该把可以再用的东西分类。只要每个人每天少浪费一点儿，城市就会变得更干净。",
      pinyin: "Zuìjìn wǒmen xuéxiào zǔzhī le yí ge bǎohù huánjìng de huódòng. Lǎoshī gàosu wǒmen, chúle shǎo yòng sùliào dài yǐwài, hái yīnggāi bǎ kěyǐ zài yòng de dōngxi fēnlèi. Zhǐyào měi ge rén měitiān shǎo làngfèi yìdiǎnr, chéngshì jiù huì biàn de gèng gānjìng.",
      vi: "Gần đây trường tôi tổ chức một hoạt động bảo vệ môi trường. Giáo viên nói ngoài dùng ít túi nhựa, chúng tôi còn nên phân loại những đồ có thể dùng lại. Chỉ cần mỗi người lãng phí ít hơn một chút mỗi ngày, thành phố sẽ sạch hơn.",
      en: "Recently our school organized an environmental-protection activity. The teacher told us that besides using fewer plastic bags, we should sort things that can be used again. As long as everyone wastes a little less each day, the city will become cleaner.",
      vocabulary: ["环境 huánjìng — environment", "塑料袋 sùliào dài — plastic bag", "分类 fēnlèi — sort", "浪费 làngfèi — waste"],
      grammar: ["除了…以外，还…", "应该", "把 + object + verb", "只要…就…", "变得 + adjective"],
      dialogue: ["A: 我们怎么保护环境？ Wǒmen zěnme bǎohù huánjìng? — How can we protect the environment?", "B: 我们可以少用塑料袋。 Wǒmen kěyǐ shǎo yòng sùliào dài. — We can use fewer plastic bags."],
      taskVi: "Nêu 2–3 việc bạn có thể làm để bảo vệ môi trường; dùng 只要…就….", taskEn: "Give 2–3 actions you can take to protect the environment; use 只要…就… ."
    }
  ];
  const normalized = (value) => String(value || "").toLowerCase().trim();
  function find(query) {
    const q = normalized(query);
    if (!q) return null;
    return items.find((item) => q.includes(item.id) || item.triggers.some((trigger) => q.includes(normalized(trigger)))) || null;
  }
  function byLevel(level) { return items.filter((item) => Number(item.level) === Number(level)); }
  window.PandaHanHskLibrary = { items, find, byLevel };
})();
