import type { AppData, Listing, User, UserSettings } from '@/types';

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const ahead = (d: number) => new Date(Date.now() + d * 86400_000).toISOString().slice(0, 10);

export const users: User[] = [
  { id: 'u1', name: 'Ananya Rao', username: 'ananya.rao', campus: 'North Campus', department: 'Mechanical Engineering', year: '2nd Year', bio: 'Fixes things, lends things. Usually found in the workshop or the library basement.', interests: ['Engineering', 'Cycling', 'Books'], hue: 160, online: true, email: 'ananya.rao@northfield.edu', joinedAt: ago(24 * 210) },
  { id: 'u2', name: 'Kabir Mehta', username: 'kabir.m', campus: 'North Campus', department: 'Computer Science', year: '3rd Year', bio: 'Coding club lead. I keep too many keyboards.', interests: ['Coding', 'Electronics'], hue: 200, online: true, email: 'kabir.m@northfield.edu', joinedAt: ago(24 * 400) },
  { id: 'u3', name: 'Meera Iyer', username: 'meera.reads', campus: 'South Campus', department: 'Economics', year: '4th Year', bio: 'Graduating soon and passing my whole bookshelf on. Ask me anything about Micro II.', interests: ['Books', 'Events'], hue: 30, online: false, email: 'meera.i@northfield.edu', joinedAt: ago(24 * 900) },
  { id: 'u4', name: 'Rohan Das', username: 'rohan.rides', campus: 'Riverside Hostels', department: 'Civil Engineering', year: '2nd Year', bio: 'Hostel 4 room 212. Bikes, badminton and bad puns.', interests: ['Sports', 'Cycling'], hue: 100, online: true, email: 'rohan.d@northfield.edu', joinedAt: ago(24 * 300) },
  { id: 'u5', name: 'Sana Qureshi', username: 'sana.frames', campus: 'South Campus', department: 'Design', year: '3rd Year', bio: 'Photography society. Will lend my spare lens if you promise golden-hour shots.', interests: ['Photography', 'Events'], hue: 340, online: false, email: 'sana.q@northfield.edu', joinedAt: ago(24 * 500) },
  { id: 'u6', name: 'Arjun Nair', username: 'arjun.n', campus: 'Engineering Block', department: 'Electrical Engineering', year: '1st Year', bio: 'New here. Looking for a calculator and good company.', interests: ['Electronics', 'Coding'], hue: 250, online: true, email: 'arjun.n@northfield.edu', joinedAt: ago(24 * 60) },
  { id: 'u7', name: 'Priya Sharma', username: 'priya.events', campus: 'North Campus', department: 'Business Administration', year: '3rd Year', bio: 'Cultural fest committee. We reuse every lantern, every year.', interests: ['Events', 'Clubs'], hue: 20, online: false, email: 'priya.s@northfield.edu', joinedAt: ago(24 * 450) },
  { id: 'u8', name: 'Vikram Singh', username: 'vik.lifts', campus: 'Riverside Hostels', department: 'Physics', year: '4th Year', bio: 'Moving out in May. Everything in my room needs a new home.', interests: ['Sports', 'Hostel'], hue: 130, online: true, email: 'vikram.s@northfield.edu', joinedAt: ago(24 * 1000) },
  { id: 'u9', name: 'Leela Fernandes', username: 'leela.f', campus: 'Engineering Block', department: 'Architecture', year: '2nd Year', bio: 'Drafting tables, scale rulers, and too much coffee.', interests: ['Engineering', 'Books'], hue: 180, online: false, email: 'leela.f@northfield.edu', joinedAt: ago(24 * 320) },
];

type L = Omit<Listing, 'likes' | 'comments'> & Partial<Pick<Listing, 'likes' | 'comments'>>;
const raw: L[] = [
  { id: 'l1', ownerId: 'u3', title: 'Casio fx-991EX Scientific Calculator', description: 'Used for two semesters of stats and econometrics. All functions work, comes with the slide cover. Battery replaced in January.', images: ['/images/calculator.jpg'], category: 'Stationery & Tools', type: 'borrow', quantity: 1, condition: 'Good', campus: 'South Campus', location: 'Economics block lobby', availability: 'Available', createdAt: ago(3), borrowDuration: 'Up to 3 weeks', returnConditions: 'Return with cover, no stickers please.', deposit: 200, availableFrom: ahead(0), availableTo: ahead(60), communityId: 'c4' },
  { id: 'l2', ownerId: 'u9', title: 'Engineering Drawing Kit (Mini Drafter + Compass Set)', description: 'Complete ED kit: mini drafter, compass, set squares, French curves and a sheet container. Perfect for first-year Engineering Graphics.', images: ['/images/drawing-kit.jpg'], category: 'Stationery & Tools', type: 'sell', price: 650, quantity: 1, condition: 'Like New', campus: 'Engineering Block', location: 'Drawing hall, 2nd floor', availability: 'Available', createdAt: ago(7) },
  { id: 'l3', ownerId: 'u2', title: 'Aluminium Laptop Stand', description: 'Adjustable height, folds flat. Saved my neck during finals. Fits laptops up to 16 inches.', images: ['/images/laptop-stand.jpg'], category: 'Electronics', type: 'sell', price: 480, quantity: 2, condition: 'Like New', campus: 'North Campus', location: 'CS department common room', availability: 'Available', createdAt: ago(12), communityId: 'c3' },
  { id: 'l4', ownerId: 'u4', title: 'Hercules City Bicycle, 7-speed', description: 'Reliable campus ride. New brake pads, slightly worn seat. Lock included.', images: ['/images/bicycle.jpg'], category: 'Bikes & Transport', type: 'sell', price: 3200, quantity: 1, condition: 'Good', campus: 'Riverside Hostels', location: 'Hostel 4 cycle stand', availability: 'Available', createdAt: ago(20) },
  { id: 'l5', ownerId: 'u8', title: 'Foldable Study Table with Lamp', description: 'Moving out, the table and lamp go together. Sturdy, a few marks on top. Free to whoever picks it up first.', images: ['/images/study-table.jpg'], category: 'Furniture', type: 'giveaway', quantity: 1, condition: 'Fair', campus: 'Riverside Hostels', location: 'Hostel 2, room 118', availability: 'Available', createdAt: ago(26), pickupDetails: 'Weekdays after 6pm. Bring a friend, it is bulky.', communityId: 'c2' },
  { id: 'l6', ownerId: 'u3', title: 'Economics Textbook Bundle (6 books)', description: 'Mankiw Macro, Varian Micro, Gujarati Econometrics and three reference guides. Light pencil notes in margins.', images: ['/images/books.jpg'], category: 'Books & Notes', type: 'giveaway', quantity: 6, condition: 'Good', campus: 'South Campus', location: 'South Library steps', availability: 'Available', createdAt: ago(30), pickupDetails: 'Pick any you need, take only what you will use.', communityId: 'c4' },
  { id: 'l7', ownerId: 'u8', title: 'Hostel Starter Kit: Kettle, Bucket, Bedsheet', description: 'Everything a first-year forgets. Electric kettle works perfectly, bedsheet washed.', images: ['/images/hostel-kit.jpg'], category: 'Hostel Essentials', type: 'giveaway', quantity: 1, condition: 'Good', campus: 'Riverside Hostels', location: 'Hostel 2 reception', availability: 'Available', createdAt: ago(40), pickupDetails: 'Leave a message, I will keep it at reception for you.', communityId: 'c2' },
  { id: 'l8', ownerId: 'u4', title: 'Badminton Rackets (pair) + Shuttle Tube', description: 'Two Yonex rackets and a half-full tube of feather shuttles. Borrow for the inter-hostel tournament.', images: ['/images/sports.jpg'], category: 'Sports', type: 'borrow', quantity: 2, condition: 'Good', campus: 'Riverside Hostels', location: 'Sports complex gate', availability: 'Available', createdAt: ago(48), borrowDuration: '1 week', returnConditions: 'Return strings intact. Replace shuttles you break.', deposit: 0, availableFrom: ahead(1), availableTo: ahead(30), communityId: 'c5' },
  { id: 'l9', ownerId: 'u2', title: 'Old Mechanical Keyboard (Blue switches)', description: 'Clicky, loud, loved. Want a wireless mouse in return — mine just died.', images: ['/images/keyboard.jpg'], category: 'Electronics', type: 'exchange', quantity: 1, condition: 'Good', campus: 'North Campus', location: 'Coding club room', availability: 'Available', createdAt: ago(55), desiredItem: 'Wireless mouse (any brand, working)', communityId: 'c8' },
  { id: 'l10', ownerId: 'u6', title: 'Over-ear Headphones', description: 'Barely used, I switched to earbuds. Good bass, cushions intact.', images: ['/images/electronics.jpg'], category: 'Electronics', type: 'exchange', quantity: 1, condition: 'Like New', campus: 'Engineering Block', location: 'EE lab corridor', availability: 'Available', createdAt: ago(62), desiredItem: 'Scientific calculator or a drawing kit', communityId: 'c3' },
  { id: 'l11', ownerId: 'u7', title: 'Fest Decorations Box: Lanterns, Fairy Lights, Bunting', description: 'Leftover from Spring Fest. Enough for a hostel night or a club event. Please return so next year can use it too.', images: ['/images/decorations.jpg'], category: 'Event Supplies', type: 'borrow', quantity: 1, condition: 'Good', campus: 'North Campus', location: 'Student activity centre', availability: 'Available', createdAt: ago(72), borrowDuration: '3 days', returnConditions: 'Fold lanterns flat, coil the lights.', deposit: 300, availableFrom: ahead(0), availableTo: ahead(45), communityId: 'c6' },
  { id: 'l12', ownerId: 'u5', title: 'Mirrorless Camera + 35mm Lens', description: 'Sony a6000 body with a 35mm prime. Lending for short shoots to photography society members.', images: ['/images/camera.jpg'], category: 'Photography', type: 'borrow', quantity: 1, condition: 'Good', campus: 'South Campus', location: 'Design studio', availability: 'Reserved', createdAt: ago(90), borrowDuration: '2 days', returnConditions: 'Return charged with the SD card wiped.', deposit: 2000, availableFrom: ahead(3), availableTo: ahead(40), communityId: 'c7' },
  { id: 'l13', ownerId: 'u1', title: 'Hercules Cycle Pump + Tool Kit', description: 'Floor pump with gauge and a hex key set. Borrow whenever, just bring it back.', images: ['/images/bicycle.jpg'], category: 'Bikes & Transport', type: 'borrow', quantity: 1, condition: 'Good', campus: 'North Campus', location: 'Mechanical workshop', availability: 'Available', createdAt: ago(100), borrowDuration: '2 days', returnConditions: 'Return to the workshop shelf.', deposit: 0, availableFrom: ahead(0), availableTo: ahead(90) },
  { id: 'l14', ownerId: 'u1', title: 'Strength of Materials Notes + Textbook', description: 'Handwritten notes, solved problem sets and the R.K. Bansal textbook. Selling as a set.', images: ['/images/books.jpg'], category: 'Books & Notes', type: 'sell', price: 350, quantity: 1, condition: 'Good', campus: 'North Campus', location: 'Central library', availability: 'Available', createdAt: ago(130), communityId: 'c4' },
  { id: 'l15', ownerId: 'u1', title: 'Desk Lamp (warm light)', description: 'Exchange for a small bookshelf or wall organiser.', images: ['/images/study-table.jpg'], category: 'Hostel Essentials', type: 'exchange', quantity: 1, condition: 'Like New', campus: 'North Campus', location: 'Girls hostel B gate', availability: 'Available', createdAt: ago(160), desiredItem: 'Small bookshelf or wall organiser' },
  { id: 'l16', ownerId: 'u9', title: 'Scale Ruler Set + Drafting Pencils', description: 'Architecture first-years, this is for you. Free.', images: ['/images/drawing-kit.jpg'], category: 'Stationery & Tools', type: 'giveaway', quantity: 3, condition: 'Like New', campus: 'Engineering Block', location: 'Architecture studio', availability: 'Available', createdAt: ago(180), pickupDetails: 'Studio is open 9am to 8pm, ask for Leela.' },
  { id: 'l17', ownerId: 'u5', title: 'Spare Camera Tripod', description: 'Lightweight aluminium tripod, one leg lock is a bit stiff.', images: ['/images/camera.jpg'], category: 'Photography', type: 'sell', price: 900, quantity: 1, condition: 'Fair', campus: 'South Campus', location: 'Design studio', availability: 'Available', createdAt: ago(200), communityId: 'c7' },
  { id: 'l18', ownerId: 'u6', title: 'Football (size 5)', description: 'Kicked around for one semester. Needs a little air.', images: ['/images/sports.jpg'], category: 'Sports', type: 'giveaway', quantity: 1, condition: 'Fair', campus: 'Engineering Block', location: 'Main ground', availability: 'Available', createdAt: ago(220), pickupDetails: 'Evenings at the main ground.', communityId: 'c5' },
];

const listings: Listing[] = raw.map((l, i) => ({
  likes: ['u2', 'u4', 'u5', 'u7', 'u8', 'u9'].slice(0, (i * 3) % 6),
  comments: i === 0 ? [{ id: 'cm1', userId: 'u6', text: 'Is this still free next week? I have a quiz on the 14th.', createdAt: ago(2) }]
    : i === 3 ? [{ id: 'cm2', userId: 'u1', text: 'Does the 7-speed shift smoothly?', createdAt: ago(18) }, { id: 'cm3', userId: 'u4', text: 'Yes, tuned it last month.', createdAt: ago(17) }]
    : [],
  ...l,
}));

const defaultSettings = (): UserSettings => ({
  visibility: 'campus', showOnline: true,
  notify: { friend: true, message: true, request: true, listing: true, email: false },
});

export function createSeed(): AppData {
  return {
    version: 1,
    currentUserId: 'u1',
    loggedOut: false,
    users,
    listings,
    requests: [
      { id: 'r1', listingId: 'l13', requesterId: 'u4', ownerId: 'u1', type: 'borrow', quantity: 1, message: 'Front tyre is flat before the morning ride. Can I borrow the pump till Thursday?', startDate: ahead(1), returnDate: ahead(3), duration: '2 days', status: 'pending', confirmations: [], createdAt: ago(5), updatedAt: ago(5) },
      { id: 'r2', listingId: 'l14', requesterId: 'u6', ownerId: 'u1', type: 'buy', quantity: 1, message: 'Need these for my SoM backlog, can meet at the library.', status: 'accepted', confirmations: ['u1'], createdAt: ago(40), updatedAt: ago(20) },
      { id: 'r3', listingId: 'l6', requesterId: 'u1', ownerId: 'u3', type: 'giveaway', quantity: 2, message: 'Could I take the Varian and the Gujarati? Taking an econ minor.', status: 'pending', confirmations: [], createdAt: ago(10), updatedAt: ago(10) },
      { id: 'r4', listingId: 'l8', requesterId: 'u1', ownerId: 'u4', type: 'borrow', quantity: 2, message: 'For the hostel tournament this weekend.', startDate: ahead(-10), returnDate: ahead(-3), duration: '1 week', status: 'completed', confirmations: ['u1', 'u4'], createdAt: ago(300), updatedAt: ago(70) },
      { id: 'r5', listingId: 'l9', requesterId: 'u1', ownerId: 'u2', type: 'exchange', quantity: 1, message: 'I have a Logitech wireless mouse, works perfectly.', offeredItem: 'Logitech M185 wireless mouse', offeredCondition: 'Good', status: 'accepted', confirmations: [], createdAt: ago(50), updatedAt: ago(30) },
      { id: 'r6', listingId: 'l15', requesterId: 'u9', ownerId: 'u1', type: 'exchange', quantity: 1, message: 'I have a small pine wall shelf, 3 tiers.', offeredItem: 'Pine wall shelf (3 tier)', offeredCondition: 'Good', status: 'rejected', confirmations: [], createdAt: ago(120), updatedAt: ago(110) },
    ],
    reviews: [
      { id: 'rv1', requestId: 'r4', fromId: 'u4', toId: 'u1', rating: 5, text: 'Returned the rackets early and even restrung one. Ideal borrower.', createdAt: ago(60) },
      { id: 'rv2', requestId: 'x', fromId: 'u3', toId: 'u4', rating: 4, text: 'Bike was exactly as described. Friendly handover.', createdAt: ago(400) },
      { id: 'rv3', requestId: 'y', fromId: 'u6', toId: 'u3', rating: 5, text: 'Gave me four books for free and a reading list. Legend.', createdAt: ago(500) },
    ],
    wants: [
      { id: 'w1', userId: 'u6', title: 'Scientific calculator for two weeks', description: 'I need a scientific calculator for my upcoming semester exams, only for two weeks until mine arrives.', category: 'Stationery & Tools', quantity: 1, condition: 'Any', neededBy: ahead(5), campus: 'Engineering Block', status: 'open', createdAt: ago(8), responses: [] },
      { id: 'w2', userId: 'u7', title: 'Extension boards for fest stalls', description: 'Need 4 extension boards (5m+) for food stalls on Saturday. Will return same night.', category: 'Event Supplies', quantity: 4, condition: 'Good', neededBy: ahead(4), campus: 'North Campus', status: 'open', createdAt: ago(16), responses: [] },
      { id: 'w3', userId: 'u2', title: 'Wireless mouse', description: 'Mine died mid-hackathon. Happy to swap or pay a little.', category: 'Electronics', quantity: 1, condition: 'Good', neededBy: ahead(7), campus: 'North Campus', status: 'open', createdAt: ago(30), responses: [{ id: 'wr1', userId: 'u1', message: 'I have a Logitech one, sent you an exchange request.', createdAt: ago(29) }] },
      { id: 'w4', userId: 'u1', title: 'Small bookshelf', description: 'Looking for a compact bookshelf for my hostel room, 3 shelves max.', category: 'Furniture', quantity: 1, condition: 'Fair', neededBy: ahead(14), campus: 'North Campus', status: 'open', createdAt: ago(50), responses: [] },
      { id: 'w5', userId: 'u5', title: 'Reflector for portrait shoot', description: 'Collapsible 5-in-1 reflector for a weekend shoot.', category: 'Photography', quantity: 1, condition: 'Any', neededBy: ahead(-2), campus: 'South Campus', status: 'fulfilled', createdAt: ago(240), responses: [] },
    ],
    conversations: [
      { id: 'cv1', participants: ['u1', 'u4'], lastRead: { u1: ago(6), u4: ago(1) }, messages: [
        { id: 'm1', senderId: 'u4', text: 'Hey, thanks again for returning the rackets so fast.', createdAt: ago(70) },
        { id: 'm2', senderId: 'u1', text: 'Of course! We made the semis.', createdAt: ago(69) },
        { id: 'm3', senderId: 'u4', text: 'Also sent you a request for the cycle pump.', createdAt: ago(5), listingId: 'l13' },
        { id: 'm4', senderId: 'u4', text: 'Front tyre is completely flat.', createdAt: ago(4.8) },
      ] },
      { id: 'cv2', participants: ['u1', 'u2'], lastRead: { u1: ago(1), u2: ago(1) }, messages: [
        { id: 'm5', senderId: 'u1', text: 'Saw your keyboard listing. I have a wireless mouse.', createdAt: ago(52), listingId: 'l9' },
        { id: 'm6', senderId: 'u2', text: 'Perfect. Accepted your request, coding club room tomorrow at 5?', createdAt: ago(30) },
        { id: 'm7', senderId: 'u1', text: 'Works for me.', createdAt: ago(29) },
      ] },
      { id: 'cv3', participants: ['u1', 'u6'], lastRead: { u1: ago(30), u6: ago(1) }, messages: [
        { id: 'm8', senderId: 'u6', text: 'Hi Ananya, is the SoM notes set still available?', createdAt: ago(41) },
        { id: 'm9', senderId: 'u1', text: 'Yes! Accepted your request. Library at 4?', createdAt: ago(20) },
        { id: 'm10', senderId: 'u6', text: 'See you there. Bringing exact change.', createdAt: ago(19) },
      ] },
      { id: 'cv4', participants: ['u1', 'u3'], lastRead: { u1: ago(1), u3: ago(9) }, messages: [
        { id: 'm11', senderId: 'u1', text: 'Hi Meera, requested two of your econ books. Thank you for giving them away!', createdAt: ago(10) },
      ] },
    ],
    notifications: [
      { id: 'n1', userId: 'u1', actorId: 'u4', type: 'borrow_request', text: 'Rohan Das wants to borrow your Cycle Pump + Tool Kit', link: '/my-requests', read: false, createdAt: ago(5) },
      { id: 'n2', userId: 'u1', actorId: 'u4', type: 'message', text: 'Rohan Das sent you a message', link: '/messages/cv1', read: false, createdAt: ago(4.8) },
      { id: 'n3', userId: 'u1', actorId: 'u5', type: 'friend_request', text: 'Sana Qureshi sent you a friend request', link: '/friends', read: false, createdAt: ago(9) },
      { id: 'n4', userId: 'u1', actorId: 'u2', type: 'request_accepted', text: 'Kabir Mehta accepted your exchange request for the Mechanical Keyboard', link: '/my-requests', read: false, createdAt: ago(30) },
      { id: 'n5', userId: 'u1', actorId: 'u9', type: 'exchange_request', text: 'Leela Fernandes offered a pine wall shelf for your Desk Lamp', link: '/my-requests', read: true, createdAt: ago(120) },
      { id: 'n6', userId: 'u1', actorId: 'u4', type: 'handover', text: 'Handover confirmed by both of you: Badminton Rackets. Leave a review.', link: '/my-requests', read: true, createdAt: ago(70) },
      { id: 'n7', userId: 'u1', actorId: 'u7', type: 'friend_accepted', text: 'Priya Sharma accepted your friend request', link: '/profile/u7', read: true, createdAt: ago(150) },
      { id: 'n8', userId: 'u1', actorId: 'u3', type: 'listing_update', text: 'Meera Iyer lowered the return period on a calculator you saved', link: '/item/l1', read: true, createdAt: ago(180) },
    ],
    friendships: [['u1', 'u2'], ['u1', 'u4'], ['u1', 'u7'], ['u1', 'u3'], ['u2', 'u6'], ['u3', 'u5'], ['u4', 'u8'], ['u2', 'u9']],
    friendRequests: [
      { id: 'fr1', fromId: 'u5', toId: 'u1', createdAt: ago(9) },
      { id: 'fr2', fromId: 'u8', toId: 'u1', createdAt: ago(26) },
    ],
    communities: [
      { id: 'c1', name: 'College Clubs Exchange', description: 'Shared props, banners and kits across every student club. Borrow before you buy.', category: 'Clubs', memberIds: ['u1', 'u7', 'u2'], baseMembers: 214, posts: [{ id: 'p1', userId: 'u7', text: 'Drama club has 12 spare chairs for the weekend if anyone needs them.', createdAt: ago(14) }] },
      { id: 'c2', name: 'Riverside Hostel Community', description: 'Move-in, move-out and everything between. Kettles, buckets, mattresses, advice.', category: 'Hostel', memberIds: ['u4', 'u8'], baseMembers: 562, posts: [{ id: 'p2', userId: 'u8', text: 'Clearing my room by May 20. Posting everything here first.', createdAt: ago(26), listingId: 'l5' }] },
      { id: 'c3', name: 'Electronics and Gadgets', description: 'Chargers, stands, keyboards, repairs. Keep working tech out of landfill.', category: 'Electronics', memberIds: ['u1', 'u2', 'u6'], baseMembers: 388, posts: [{ id: 'p3', userId: 'u2', text: 'Anyone with a soldering iron? Fixing a headphone jack.', createdAt: ago(20) }] },
      { id: 'c4', name: 'Books and Study Materials', description: 'Textbooks, notes, guides and lab manuals passed down the years.', category: 'Books', memberIds: ['u1', 'u3', 'u9'], baseMembers: 731, posts: [{ id: 'p4', userId: 'u3', text: 'Giving away my full econ shelf. Check my listings before Friday.', createdAt: ago(30), listingId: 'l6' }] },
      { id: 'c5', name: 'Sports Equipment Pool', description: 'Rackets, balls, mats. Play more, buy less.', category: 'Sports', memberIds: ['u4', 'u6'], baseMembers: 296, posts: [{ id: 'p5', userId: 'u4', text: 'Inter-hostel badminton starts Monday. Rackets available to borrow.', createdAt: ago(48), listingId: 'l8' }] },
      { id: 'c6', name: 'Events and Workshops', description: 'Decor, AV and supplies that come back after every fest.', category: 'Events', memberIds: ['u7'], baseMembers: 177, posts: [] },
      { id: 'c7', name: 'Photography Society', description: 'Lenses, tripods and reflectors shared between members.', category: 'Photography', memberIds: ['u5'], baseMembers: 143, posts: [{ id: 'p6', userId: 'u5', text: 'Golden hour walk Sunday 5pm at the lake. Spare camera available to borrow.', createdAt: ago(60) }] },
      { id: 'c8', name: 'Coding Community', description: 'Hackathon gear swaps, keyboards, dev boards and late-night help.', category: 'Coding', memberIds: ['u2', 'u6'], baseMembers: 419, posts: [{ id: 'p7', userId: 'u2', text: 'Swapping my old keyboard for a mouse, see listing.', createdAt: ago(55), listingId: 'l9' }] },
    ],
    saved: { u1: ['l1', 'l4', 'l11'] },
    settings: Object.fromEntries(users.map((u) => [u.id, defaultSettings()])),
  };
}

export { defaultSettings };
