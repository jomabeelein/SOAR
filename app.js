// East Central MS S.O.A.R. System Application Logic
document.addEventListener("DOMContentLoaded", () => {
    
    // State Management
    let currentLang = "en";
    let rawNominations = JSON.parse(localStorage.getItem("ecms_soar_nominations")) || INITIAL_NOMINATIONS;
    // Clear out rejected nominations and keep approved/pending nominations
    let nominations = rawNominations.filter(n => n.status !== "Rejected");
    localStorage.setItem("ecms_soar_nominations", JSON.stringify(nominations));
    let storedPasscode = localStorage.getItem("ecms_soar_dean_passcode") || "SOAR2026";
    let storedTeacherPasscode = localStorage.getItem("ecms_soar_teacher_passcode") || "CARDINALS";

    // Student Co-Created Reward Ideas State
    const DEFAULT_REWARD_IDEAS = [
        { id: "idea-kurland-book", studentName: "Student Council & Library", grade: "All Grades", title: "Token to Ms. Kurland's Book Vending Machine", cost: "5 SOAR Bucks", reason: "Earn a gold token to pick any brand-new book of your choice from Ms. Kurland's famous Book Vending Machine in the library!", status: "Approved", date: "2026-08-01" },
        { id: "idea-cricut-swag", studentName: "7th Grade STEM Makerspace", grade: "7th Grade", title: "Make Your Own Swag using the Cricut", cost: "10 SOAR Bucks", reason: "Design and craft your own custom vinyl Cardinal sticker, water bottle decal, or notebook art using the school Cricut machine!", status: "Approved", date: "2026-08-02" },
        { id: "idea-morning-announcer", studentName: "Jordan Lee (8th Grade)", grade: "8th Grade", title: "Guest Morning Announcer on School Intercom", cost: "15 SOAR Bucks", reason: "Join the administration team on the microphone to read morning announcements, sports highlights, and Cardinal shoutouts over the school-wide intercom!", status: "Approved", date: "2026-08-03" },
        { id: "idea-1", studentName: "Maya Lin", grade: "7th Grade", title: "Front of Lunch Line Pass", cost: "5 SOAR Bucks", reason: "Lets students get lunch early with 2 friends when they show S.O.A.R. behavior in morning classes.", status: "Approved", date: "2026-08-01" },
        { id: "idea-2", studentName: "Student Council", grade: "Student Leadership / Club", title: "Friday DJ Lunch Song Request", cost: "5 SOAR Bucks", reason: "Play student-requested clean music on cafeteria speakers on Friday afternoon.", status: "Approved", date: "2026-08-02" },
        { id: "idea-3", studentName: "Jordan Rivera", grade: "8th Grade", title: "Auxiliary Gym VIP Recess Access", cost: "10 SOAR Bucks", reason: "Open gym time for basketball & games during recess for students keeping campus clean.", status: "Approved", date: "2026-08-03" },
        { id: "idea-4", studentName: "Sam Smith", grade: "6th Grade", title: "Principal for a Period", cost: "25 SOAR Bucks VIP", reason: "Shadow the Principal, make morning announcements, and sit in the executive office chair!", status: "Approved", date: "2026-08-04" }
    ];

    let storedIdeas = JSON.parse(localStorage.getItem("ecms_soar_reward_ideas")) || [];
    // Ensure all default ideas exist
    DEFAULT_REWARD_IDEAS.forEach(defIdea => {
        if (!storedIdeas.some(i => i.title.toLowerCase() === defIdea.title.toLowerCase())) {
            storedIdeas.push(defIdea);
        }
    });
    let rewardIdeas = storedIdeas.length > 0 ? storedIdeas : DEFAULT_REWARD_IDEAS;
    localStorage.setItem("ecms_soar_reward_ideas", JSON.stringify(rewardIdeas));

    let isDeanAuthenticated = sessionStorage.getItem("ecms_soar_is_dean") === "true";
    let isTeacherAuthenticated = sessionStorage.getItem("ecms_soar_is_teacher") === "true";

    let activeSlideIndex = 0;
    let autoPlayInterval = null;
    let currentParentFormat = "email";
    let selectedParentNomId = null;

    let selectedLocation = "Classroom";
    let selectedPillar = "S";
    let selectedExpectation = "";

    // SOAR Bucks Studio Mode State
    let ticketStudioMode = "students"; // "students" or "blank"
    let selectedTicketIds = new Set();

    // Student of the Month Filter State
    let sotmSelectedGrade = "all";
    let sotmSelectedMode = "month"; // "month", "quarter", "semester", "year"
    let awardedSotmStudents = JSON.parse(localStorage.getItem("ecms_soar_sotm_awarded")) || {};

    function saveState() {
        localStorage.setItem("ecms_soar_nominations", JSON.stringify(nominations));
        localStorage.setItem("ecms_soar_sotm_awarded", JSON.stringify(awardedSotmStudents));
        localStorage.setItem("ecms_soar_reward_ideas", JSON.stringify(rewardIdeas));
        updatePendingBadge();
        renderApprovedRewardStore();
    }

    // Header Lock Status Button Guard
    const sessionLockStatusBtn = document.getElementById("sessionLockStatusBtn");
    const lockStatusText = document.getElementById("lockStatusText");
    const adminLockScreen = document.getElementById("adminLockScreen");
    const adminMainContent = document.getElementById("adminMainContent");
    const teacherLockScreen = document.getElementById("teacherLockScreen");
    const teacherMainContent = document.getElementById("teacherMainContent");

    function updateSecurityUI() {
        // Admin Portal Lock State
        if (isDeanAuthenticated) {
            if (adminLockScreen) adminLockScreen.style.display = "none";
            if (adminMainContent) adminMainContent.className = "protected-content-visible";
            renderAnalytics();
            renderSlideDeck();
            renderTicketsGrid();
            renderParentCenter();
            renderSotmLeaderboard();
            renderRewardIdeasQueue();
        } else {
            if (adminLockScreen) adminLockScreen.style.display = "block";
            if (adminMainContent) adminMainContent.className = "protected-content-hidden";
        }

        // Teacher Portal Lock State
        if (isTeacherAuthenticated) {
            if (teacherLockScreen) teacherLockScreen.style.display = "none";
            if (teacherMainContent) teacherMainContent.className = "protected-content-visible";
            renderQuickSkillChips();
        } else {
            if (teacherLockScreen) teacherLockScreen.style.display = "block";
            if (teacherMainContent) teacherMainContent.className = "protected-content-hidden";
        }

        // Header Status Indicator
        if (sessionLockStatusBtn && lockStatusText) {
            if (isDeanAuthenticated && isTeacherAuthenticated) {
                sessionLockStatusBtn.className = "lock-status-btn unlocked";
                lockStatusText.textContent = "All Staff Portals Unlocked";
            } else if (isDeanAuthenticated) {
                sessionLockStatusBtn.className = "lock-status-btn unlocked";
                lockStatusText.textContent = "Dean Portal Unlocked";
            } else if (isTeacherAuthenticated) {
                sessionLockStatusBtn.className = "lock-status-btn unlocked";
                lockStatusText.textContent = "Teacher Portal Unlocked";
            } else {
                sessionLockStatusBtn.className = "lock-status-btn locked";
                lockStatusText.textContent = "Portals Protected 🔒";
            }
        }
    }

    updateSecurityUI();

    // Dean Passcode Form Handler
    const deanPasscodeForm = document.getElementById("deanPasscodeForm");
    const deanPasscodeInput = document.getElementById("deanPasscodeInput");
    const passcodeError = document.getElementById("passcodeError");

    if (deanPasscodeForm) {
        deanPasscodeForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputVal = deanPasscodeInput.value.trim();
            if (inputVal === storedPasscode) {
                isDeanAuthenticated = true;
                sessionStorage.setItem("ecms_soar_is_dean", "true");
                if (passcodeError) passcodeError.style.display = "none";
                if (deanPasscodeInput) deanPasscodeInput.value = "";
                updateSecurityUI();
                renderModerationQueue();
            } else {
                if (passcodeError) passcodeError.style.display = "block";
                if (deanPasscodeInput) deanPasscodeInput.value = "";
            }
        });
    }

    // Teacher Passcode Form Handler
    const teacherPasscodeForm = document.getElementById("teacherPasscodeForm");
    const teacherPasscodeInput = document.getElementById("teacherPasscodeInput");
    const teacherPasscodeError = document.getElementById("teacherPasscodeError");

    if (teacherPasscodeForm) {
        teacherPasscodeForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputVal = teacherPasscodeInput.value.trim();
            if (inputVal === storedTeacherPasscode) {
                isTeacherAuthenticated = true;
                sessionStorage.setItem("ecms_soar_is_teacher", "true");
                if (teacherPasscodeError) teacherPasscodeError.style.display = "none";
                if (teacherPasscodeInput) teacherPasscodeInput.value = "";
                updateSecurityUI();
            } else {
                if (teacherPasscodeError) teacherPasscodeError.style.display = "block";
                if (teacherPasscodeInput) teacherPasscodeInput.value = "";
            }
        });
    }

    const lockTeacherNowBtn = document.getElementById("lockTeacherNowBtn");
    if (lockTeacherNowBtn) {
        lockTeacherNowBtn.addEventListener("click", () => {
            isTeacherAuthenticated = false;
            sessionStorage.removeItem("ecms_soar_is_teacher");
            updateSecurityUI();
        });
    }

    if (sessionLockStatusBtn) {
        sessionLockStatusBtn.addEventListener("click", () => {
            if (isDeanAuthenticated || isTeacherAuthenticated) {
                if (confirm("Lock all active staff portal sessions?")) {
                    isDeanAuthenticated = false;
                    isTeacherAuthenticated = false;
                    sessionStorage.removeItem("ecms_soar_is_dean");
                    sessionStorage.removeItem("ecms_soar_is_teacher");
                    updateSecurityUI();
                }
            } else {
                document.querySelector("[data-tab='tab-teacher']").click();
            }
        });
    }

    const lockHubNowBtn = document.getElementById("lockHubNowBtn");
    if (lockHubNowBtn) lockHubNowBtn.addEventListener("click", lockAdminSession);

    function lockAdminSession() {
        isDeanAuthenticated = false;
        sessionStorage.removeItem("ecms_soar_is_dean");
        updateSecurityUI();
    }

    const changePasscodeBtn = document.getElementById("changePasscodeBtn");
    if (changePasscodeBtn) {
        changePasscodeBtn.addEventListener("click", () => {
            const current = prompt("Enter current Dean Passcode:");
            if (current === storedPasscode) {
                const newPass = prompt("Enter NEW Dean Passcode:");
                if (newPass && newPass.length >= 4) {
                    storedPasscode = newPass;
                    localStorage.setItem("ecms_soar_dean_passcode", newPass);
                    alert("Passcode updated successfully!");
                } else alert("Passcode must be at least 4 characters.");
            } else if (current !== null) alert("Incorrect passcode.");
        });
    }

    // MAIN NAVIGATION TAB SWITCHER
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");

            navButtons.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) targetPanel.classList.add("active");

            if (targetTab === "tab-admin" && isDeanAuthenticated) renderModerationQueue();
            if (targetTab === "tab-teacher" && isTeacherAuthenticated) renderQuickSkillChips();
            if (targetTab === "tab-matrix") renderMatrixTable();
            if (targetTab === "tab-store") renderApprovedRewardStore();
        });
    });

    // TEACHER PORTAL SUBTAB SWITCHER
    const tsubtabQuickBtn = document.getElementById("tsubtabQuickBtn");
    const tsubtabClassBtn = document.getElementById("tsubtabClassBtn");
    const teacherSubpanelQuick = document.getElementById("teacherSubpanelQuick");
    const teacherSubpanelClass = document.getElementById("teacherSubpanelClass");

    if (tsubtabQuickBtn && tsubtabClassBtn) {
        tsubtabQuickBtn.addEventListener("click", () => {
            tsubtabQuickBtn.classList.add("active");
            tsubtabClassBtn.classList.remove("active");
            if (teacherSubpanelQuick) teacherSubpanelQuick.classList.add("active");
            if (teacherSubpanelClass) teacherSubpanelClass.classList.remove("active");
            renderQuickSkillChips();
        });

        tsubtabClassBtn.addEventListener("click", () => {
            tsubtabClassBtn.classList.add("active");
            tsubtabQuickBtn.classList.remove("active");
            if (teacherSubpanelClass) teacherSubpanelClass.classList.add("active");
            if (teacherSubpanelQuick) teacherSubpanelQuick.classList.remove("active");
        });
    }

    // ADMIN PORTAL SUBTAB SWITCHER
    const subtabModBtn = document.getElementById("subtabModBtn");
    const subtabRewardIdeasBtn = document.getElementById("subtabRewardIdeasBtn");
    const subtabSotmBtn = document.getElementById("subtabSotmBtn");
    const subtabSlidesBtn = document.getElementById("subtabSlidesBtn");
    const subtabTicketsBtn = document.getElementById("subtabTicketsBtn");
    const subtabParentBtn = document.getElementById("subtabParentBtn");
    const subtabAnalyticsBtn = document.getElementById("subtabAnalyticsBtn");

    const adminSubpanelMod = document.getElementById("adminSubpanelMod");
    const adminSubpanelRewardIdeas = document.getElementById("adminSubpanelRewardIdeas");
    const adminSubpanelSotm = document.getElementById("adminSubpanelSotm");
    const adminSubpanelSlides = document.getElementById("adminSubpanelSlides");
    const adminSubpanelTickets = document.getElementById("adminSubpanelTickets");
    const adminSubpanelParent = document.getElementById("adminSubpanelParent");
    const adminSubpanelAnalytics = document.getElementById("adminSubpanelAnalytics");

    const subBtns = [subtabModBtn, subtabRewardIdeasBtn, subtabSotmBtn, subtabSlidesBtn, subtabTicketsBtn, subtabParentBtn, subtabAnalyticsBtn];
    const subPanels = [adminSubpanelMod, adminSubpanelRewardIdeas, adminSubpanelSotm, adminSubpanelSlides, adminSubpanelTickets, adminSubpanelParent, adminSubpanelAnalytics];

    function activateAdminSubtab(targetBtn, targetPanel) {
        subBtns.forEach(b => b && b.classList.remove("active"));
        subPanels.forEach(p => p && p.classList.remove("active"));

        if (targetBtn) targetBtn.classList.add("active");
        if (targetPanel) targetPanel.classList.add("active");

        if (targetPanel === adminSubpanelMod) renderModerationQueue();
        if (targetPanel === adminSubpanelRewardIdeas) renderRewardIdeasQueue();
        if (targetPanel === adminSubpanelSotm) renderSotmLeaderboard();
        if (targetPanel === adminSubpanelSlides) renderSlideDeck();
        if (targetPanel === adminSubpanelTickets) renderTicketsGrid();
        if (targetPanel === adminSubpanelParent) renderParentCenter();
        if (targetPanel === adminSubpanelAnalytics) renderAnalytics();
    }

    if (subtabModBtn) subtabModBtn.addEventListener("click", () => activateAdminSubtab(subtabModBtn, adminSubpanelMod));
    if (subtabRewardIdeasBtn) subtabRewardIdeasBtn.addEventListener("click", () => activateAdminSubtab(subtabRewardIdeasBtn, adminSubpanelRewardIdeas));
    if (subtabSotmBtn) subtabSotmBtn.addEventListener("click", () => activateAdminSubtab(subtabSotmBtn, adminSubpanelSotm));
    if (subtabSlidesBtn) subtabSlidesBtn.addEventListener("click", () => activateAdminSubtab(subtabSlidesBtn, adminSubpanelSlides));
    if (subtabTicketsBtn) subtabTicketsBtn.addEventListener("click", () => activateAdminSubtab(subtabTicketsBtn, adminSubpanelTickets));
    if (subtabParentBtn) subtabParentBtn.addEventListener("click", () => activateAdminSubtab(subtabParentBtn, adminSubpanelParent));
    if (subtabAnalyticsBtn) subtabAnalyticsBtn.addEventListener("click", () => activateAdminSubtab(subtabAnalyticsBtn, adminSubpanelAnalytics));

    // STUDENT CO-CREATED REWARDS FORM & STORE ENGINE
    const rewardIdeaForm = document.getElementById("rewardIdeaForm");
    if (rewardIdeaForm) {
        rewardIdeaForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const studentName = document.getElementById("ideaStudentName").value.trim() || "Anonymous Student";
            const grade = document.getElementById("ideaGrade").value;
            const title = document.getElementById("ideaTitle").value.trim();
            const cost = document.getElementById("ideaSuggestedCost").value;
            const reason = document.getElementById("ideaReason").value.trim();

            const newIdea = {
                id: `idea-${Date.now()}`,
                type: "reward_idea",
                studentName,
                grade,
                title,
                cost,
                reason,
                status: "Pending Review",
                date: new Date().toISOString().split("T")[0]
            };

            rewardIdeas.unshift(newIdea);
            saveState();
            syncNominationToCloud(newIdea);

            if (typeof confetti === "function") confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

            alert(`💡 Thank you! Your reward idea "${title}" has been sent directly to the Deans & Admin team for store approval!`);
            rewardIdeaForm.reset();
        });
    }

    // STUDENT REWARD REQUEST / REDEMPTION FORM
    const rewardRequestForm = document.getElementById("rewardRequestForm");
    if (rewardRequestForm) {
        rewardRequestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const studentName = document.getElementById("reqStudentName").value.trim();
            const grade = document.getElementById("reqGrade").value;
            const rewardChoice = document.getElementById("reqRewardSelect").value;
            const teacher = document.getElementById("reqStaffTeacher").value.trim();

            const newRequest = {
                id: `req-${Date.now()}`,
                type: "reward_request",
                studentName,
                grade,
                nominatorName: teacher,
                nominatorRole: "Advisory Teacher",
                pillar: "STORE",
                pillarName: "SOAR Store Redemption",
                location: "Rewards Store",
                reason: `[REWARD REDEMPTION REQUEST]: ${rewardChoice}. Homeroom Teacher: ${teacher}`,
                alignmentScore: "High",
                status: "Pending",
                adminNote: "Reward Redemption Request",
                date: new Date().toISOString().split("T")[0]
            };

            nominations.unshift(newRequest);
            saveState();
            syncNominationToCloud(newRequest);

            if (typeof confetti === "function") confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

            alert(`🎟️ Reward request for "${rewardChoice}" submitted to Deans for verification!`);
            rewardRequestForm.reset();
        });
    }

    function getRewardIcon(title) {
        const t = title.toLowerCase();
        if (t.includes("book") || t.includes("kurland") || t.includes("vending")) return "📚";
        if (t.includes("cricut") || t.includes("swag") || t.includes("sticker")) return "🎨";
        if (t.includes("announcer") || t.includes("intercom") || t.includes("mic")) return "🎙️";
        if (t.includes("lunch")) return "🥪";
        if (t.includes("dj") || t.includes("song") || t.includes("music")) return "🎧";
        if (t.includes("gym") || t.includes("recess") || t.includes("ball")) return "🏀";
        if (t.includes("principal") || t.includes("dean")) return "👑";
        if (t.includes("chair")) return "🪑";
        if (t.includes("homework")) return "🎒";
        return "🎟️";
    }

    function renderApprovedRewardStore() {
        const container = document.getElementById("approvedRewardIdeasContainer");
        if (!container) return;

        const approvedList = rewardIdeas.filter(i => i.status === "Approved");
        container.innerHTML = "";

        if (approvedList.length === 0) {
            container.innerHTML = `<p style="font-size:0.85rem; color:#64748B;">No co-created reward ideas approved yet. Be the first to submit an idea!</p>`;
            return;
        }

        approvedList.forEach(idea => {
            const icon = getRewardIcon(idea.title);
            const card = document.createElement("div");
            card.style.cssText = "background:#FFF; border:1.5px solid #E2E8F0; padding:1rem; border-radius:10px; box-shadow: 0 2px 4px rgba(0,0,0,0.03); transition: transform 0.15s ease;";
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem; gap:0.5rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="font-size:1.4rem;">${icon}</span>
                        <strong style="color:#0F172A; font-size:0.95rem; line-height:1.2;">${idea.title}</strong>
                    </div>
                    <span style="background:#FEF3C7; color:#92400E; font-size:0.75rem; font-weight:900; padding:0.2rem 0.55rem; border-radius:999px; white-space:nowrap; border:1px solid #FDE68A;">${idea.cost}</span>
                </div>
                <div style="font-size:0.82rem; color:#475569; margin-bottom:0.45rem; line-height:1.4;">"${idea.reason}"</div>
                <div style="font-size:0.75rem; color:#64748B; font-weight:700; display:flex; align-items:center; gap:0.35rem;">
                    <span>💡 Co-created by:</span> <span style="color:#8B0000;">${idea.studentName} (${idea.grade})</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderApprovedRewardStore();

    function renderRewardIdeasQueue() {
        const queueList = document.getElementById("rewardIdeasQueueList");
        if (!queueList || !isDeanAuthenticated) return;

        queueList.innerHTML = "";

        if (rewardIdeas.length === 0) {
            queueList.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:3rem; background:#FFF; border-radius:12px;">
                    <p style="font-size:1.1rem; color:#475569; font-weight:700;">No student reward ideas submitted yet.</p>
                </div>
            `;
            return;
        }

        rewardIdeas.forEach(idea => {
            const card = document.createElement("div");
            card.className = "nom-card";
            card.style.borderLeft = idea.status === 'Approved' ? '6px solid #10B981' : (idea.status === 'Rejected' ? '6px solid #EF4444' : '6px solid #F59E0B');

            card.innerHTML = `
                <div class="nom-card-header">
                    <div>
                        <div class="student-title">${idea.title}</div>
                        <div class="nom-meta">Suggested by <strong>${idea.studentName}</strong> (${idea.grade}) • ${idea.date}</div>
                    </div>
                    <span class="status-badge" style="background:${idea.status==='Approved'?'#D1FAE5':(idea.status==='Rejected'?'#FEE2E2':'#FEF3C7')}; color:${idea.status==='Approved'?'#065F46':(idea.status==='Rejected'?'#991B1B':'#92400E')}">${idea.status}</span>
                </div>

                <div style="margin: 0.5rem 0;">
                    <span class="prompt-chip" style="background:#0F172A; color:#FFF;">🏷️ ${idea.cost}</span>
                </div>

                <div class="nom-reason-box">
                    "${idea.reason}"
                </div>

                <div class="admin-card-actions">
                    ${idea.status !== 'Approved' ? `<button class="btn btn-primary btn-sm" onclick="updateRewardIdeaStatus('${idea.id}', 'Approved')">✅ Approve & Add to Store</button>` : ''}
                    ${idea.status !== 'Rejected' ? `<button class="btn btn-ghost btn-sm" style="color:#EF4444;" onclick="updateRewardIdeaStatus('${idea.id}', 'Rejected')">❌ Reject Idea</button>` : ''}
                </div>
            `;
            queueList.appendChild(card);
        });
    }

    window.updateRewardIdeaStatus = function(id, newStatus) {
        if (!isDeanAuthenticated) return;
        const target = rewardIdeas.find(i => i.id === id);
        if (target) {
            target.status = newStatus;
            target.type = "reward_idea";
            saveState();
            syncNominationToCloud(target);
            renderRewardIdeasQueue();
            renderApprovedRewardStore();
        }
    };

    // NOMINATION FORM: LOCATION CHIP BUTTON TOGGLE & MATRIX RENDERER
    const locationBtnGrid = document.getElementById("locationBtnGrid");
    const locationCategoryInput = document.getElementById("locationCategory");

    // MULTI-SELECT STATE FOR NOMINATION FORM & QUICK ADD
    let selectedExpectationsList = []; // [{ pillar, text }]
    let quickSelectedSkillsList = [];  // [{ pillar, text }]

    if (locationBtnGrid) {
        locationBtnGrid.addEventListener("click", (e) => {
            const btn = e.target.closest(".location-chip-btn");
            if (!btn) return;

            document.querySelectorAll(".location-chip-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            selectedLocation = btn.getAttribute("data-location");
            if (locationCategoryInput) locationCategoryInput.value = selectedLocation;
            selectedExpectationsList = []; // Reset on location switch for fresh selection
            renderInteractiveLocationMatrix(selectedLocation);
        });
    }

    const interactiveLocationTitle = document.getElementById("interactiveLocationTitle");
    const soarPillarsInteractiveGrid = document.getElementById("soarPillarsInteractiveGrid");
    const soarPillarInput = document.getElementById("soarPillar");
    const selectedExpectationInput = document.getElementById("selectedExpectationText");
    const nominationReasonInput = document.getElementById("nominationReason");

    function getSpanishLocation(loc) {
        const map = {
            "Classroom": "Salón de clases",
            "Hallway": "Pasillo",
            "Cafeteria": "Cafetería",
            "Bathroom": "Baño",
            "Office": "Oficina",
            "Stairwell": "Escaleras",
            "Assemblies": "Asambleas",
            "Technology": "Tecnología"
        };
        return map[loc] || loc;
    }

    function renderInteractiveLocationMatrix(location) {
        if (!soarPillarsInteractiveGrid) return;
        soarPillarsInteractiveGrid.innerHTML = "";

        const matrixData = SOAR_MATRIX[currentLang] || SOAR_MATRIX.en;
        const locTitle = currentLang === "es" ? `Expectativas S.O.A.R. en ${getSpanishLocation(location)}` : `📍 ${location} S.O.A.R. Expectations`;
        if (interactiveLocationTitle) interactiveLocationTitle.textContent = locTitle;

        matrixData.pillars.forEach(pillarObj => {
            const pillarBox = document.createElement("div");
            pillarBox.className = `pillar-box pillar-${pillarObj.code}`;

            const items = pillarObj.items[location] || pillarObj.items["Classroom"] || [];

            pillarBox.innerHTML = `
                <div class="pillar-box-header" style="color:${pillarObj.color};">
                    <span>${pillarObj.code} - ${pillarObj.shortName}</span>
                </div>
                <div class="expectation-buttons-list">
                    ${items.map(item => {
                        const isSel = selectedExpectationsList.some(s => s.text === item && s.pillar === pillarObj.code);
                        return `
                            <button type="button" class="expectation-btn ${isSel ? 'selected' : ''}" data-pillar="${pillarObj.code}" data-text="${item}">
                                ${isSel ? '✓' : '+'} ${item}
                            </button>
                        `;
                    }).join('')}
                </div>
            `;

            soarPillarsInteractiveGrid.appendChild(pillarBox);
        });

        soarPillarsInteractiveGrid.querySelectorAll(".expectation-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const code = btn.getAttribute("data-pillar");
                const text = btn.getAttribute("data-text");

                const existIdx = selectedExpectationsList.findIndex(s => s.text === text && s.pillar === code);
                if (existIdx >= 0) {
                    selectedExpectationsList.splice(existIdx, 1);
                    btn.classList.remove("selected");
                    btn.textContent = `+ ${text}`;
                } else {
                    selectedExpectationsList.push({ pillar: code, text });
                    btn.classList.add("selected");
                    btn.textContent = `✓ ${text}`;
                }

                updateMultiSelectFormContent(location);
            });
        });
    }

    function updateMultiSelectFormContent(location) {
        if (selectedExpectationsList.length === 0) {
            if (soarPillarInput) soarPillarInput.value = "S";
            if (selectedExpectationInput) selectedExpectationInput.value = "";
            if (nominationReasonInput && nominationReasonInput.value.startsWith("Demonstrated ")) {
                nominationReasonInput.value = "";
                nominationReasonInput.dispatchEvent(new Event("input"));
            }
            return;
        }

        const uniquePillars = Array.from(new Set(selectedExpectationsList.map(s => s.pillar)));
        if (soarPillarInput) soarPillarInput.value = uniquePillars.join("/");
        if (selectedExpectationInput) selectedExpectationInput.value = selectedExpectationsList.map(s => s.text).join("; ");

        if (nominationReasonInput) {
            const skillLines = selectedExpectationsList.map(s => `• [${s.pillar} - ${getPillarFullName(s.pillar)}] ${s.text}`);
            const autoHeader = `Demonstrated ${uniquePillars.join("/")} S.O.A.R. expectations in the ${location}:`;
            const autoBody = `${autoHeader}\n${skillLines.join('\n')}`;

            const currentVal = nominationReasonInput.value.trim();
            if (!currentVal || currentVal.startsWith("Demonstrated ")) {
                nominationReasonInput.value = autoBody + "\n\nSpecific Story & Impact: ";
            } else if (!skillLines.some(l => currentVal.includes(l))) {
                nominationReasonInput.value = `${currentVal}\n\n[Attached SOAR Skills]:\n${skillLines.join('\n')}`;
            }
            nominationReasonInput.dispatchEvent(new Event("input"));
        }
    }

    renderInteractiveLocationMatrix("Classroom");

    // TEACHER EXPRESS QUICK ADD CATEGORIZED SKILL BUTTONS RENDERER
    const quickLocation = document.getElementById("quickLocation");
    const quickSkillChipsGrid = document.getElementById("quickSkillChipsGrid");
    const quickSelectedSkillInput = document.getElementById("quickSelectedSkill");
    const quickSelectedPillarInput = document.getElementById("quickSelectedPillar");
    const quickSelectedSkillBadge = document.getElementById("quickSelectedSkillBadge");

    function renderQuickSkillChips() {
        if (!quickSkillChipsGrid) return;
        quickSkillChipsGrid.innerHTML = "";

        const loc = quickLocation ? quickLocation.value : "Classroom";
        const matrixData = SOAR_MATRIX[currentLang] || SOAR_MATRIX.en;

        matrixData.pillars.forEach(pillarObj => {
            const pillarBox = document.createElement("div");
            pillarBox.className = `pillar-box pillar-${pillarObj.code}`;
            const items = pillarObj.items[loc] || pillarObj.items["Classroom"] || [];

            pillarBox.innerHTML = `
                <div class="pillar-box-header" style="color:${pillarObj.color};">
                    <span>${pillarObj.code} - ${pillarObj.shortName}</span>
                </div>
                <div class="expectation-buttons-list">
                    ${items.map(item => {
                        const isSel = quickSelectedSkillsList.some(s => s.text === item && s.pillar === pillarObj.code);
                        return `
                            <button type="button" class="quick-skill-btn ${isSel ? 'selected' : ''}" data-pillar="${pillarObj.code}" data-text="${item}">
                                ${isSel ? '✓' : '+'} ${item}
                            </button>
                        `;
                    }).join('')}
                </div>
            `;
            quickSkillChipsGrid.appendChild(pillarBox);
        });

        quickSkillChipsGrid.querySelectorAll(".quick-skill-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const code = btn.getAttribute("data-pillar");
                const text = btn.getAttribute("data-text");

                const existIdx = quickSelectedSkillsList.findIndex(s => s.text === text && s.pillar === code);
                if (existIdx >= 0) {
                    quickSelectedSkillsList.splice(existIdx, 1);
                    btn.classList.remove("selected");
                    btn.textContent = `+ ${text}`;
                } else {
                    quickSelectedSkillsList.push({ pillar: code, text });
                    btn.classList.add("selected");
                    btn.textContent = `✓ ${text}`;
                }

                if (quickSelectedSkillBadge) {
                    if (quickSelectedSkillsList.length === 0) {
                        if (quickSelectedPillarInput) quickSelectedPillarInput.value = "S";
                        if (quickSelectedSkillInput) quickSelectedSkillInput.value = "";
                        quickSelectedSkillBadge.innerHTML = `Selected Skills: <em>(Click 1 or more SOAR skill buttons above)</em>`;
                        quickSelectedSkillBadge.style.background = "#F8FAFC";
                        quickSelectedSkillBadge.style.borderColor = "#E2E8F0";
                        quickSelectedSkillBadge.style.color = "#64748B";
                    } else {
                        const uniquePillars = Array.from(new Set(quickSelectedSkillsList.map(s => s.pillar))).join("/");
                        const skillsSummary = quickSelectedSkillsList.map(s => `[${s.pillar}] "${s.text}"`).join("; ");

                        if (quickSelectedPillarInput) quickSelectedPillarInput.value = uniquePillars;
                        if (quickSelectedSkillInput) quickSelectedSkillInput.value = skillsSummary;

                        quickSelectedSkillBadge.innerHTML = `✅ Selected (${quickSelectedSkillsList.length} Skills): <strong>${skillsSummary}</strong>`;
                        quickSelectedSkillBadge.style.background = "#D1FAE5";
                        quickSelectedSkillBadge.style.borderColor = "#10B981";
                        quickSelectedSkillBadge.style.color = "#065F46";
                    }
                }
            });
        });
    }

    if (quickLocation) quickLocation.addEventListener("change", () => {
        quickSelectedSkillsList = []; // Reset on location switch
        renderQuickSkillChips();
    });
    renderQuickSkillChips();

    // Alignment & Bias / Deficit Language Checker
    const alignmentBox = document.getElementById("alignmentFeedback");
    const alignmentBadge = document.getElementById("alignmentBadge");
    const alignmentText = document.getElementById("alignmentText");

    function analyzeReasonAlignment(text) {
        const trimmed = text.trim();
        const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
        const lower = trimmed.toLowerCase();

        if (wordCount === 0) {
            return {
                score: "Neutral",
                tag: "Waiting for input...",
                msg: "Select a location and SOAR expectation button above, then add specific details of what the student did.",
                cssClass: "quality-neutral"
            };
        }

        const deficitPhrases = ["quiet for once", "didn't talk back", "wasn't causing trouble", "finally listened", "actually behaved", "didn't fight today", "wasn't loud today"];
        const hasDeficitPhrasing = deficitPhrases.some(phrase => lower.includes(phrase));

        if (hasDeficitPhrasing) {
            return {
                score: "Low",
                tag: "⚠️ Deficit Language Flagged",
                msg: "⚠️ Nomination contains backhanded phrasing. Focus on positive SOAR behavior rather than what the student avoided doing.",
                cssClass: "quality-low"
            };
        }

        const vaguePhrases = ["he is good", "she is nice", "cool guy", "nice student", "good job", "he is cool", "best student"];
        const isVague = vaguePhrases.some(phrase => lower.includes(phrase)) && wordCount < 8;

        if (wordCount < 6 || isVague) {
            return {
                score: "Low",
                tag: "Low Detail / Vague",
                msg: "⚠️ Nomination is very short or generic. Click a SOAR expectation button above to anchor it to school expectations!",
                cssClass: "quality-low"
            };
        }

        const specificActionWords = ["helped", "stayed", "cleaned", "explained", "encouraged", "listened", "returned", "organized", "de-escalated", "completed", "supported", "shared", "demonstrated"];
        const hasSpecificAction = specificActionWords.some(w => lower.includes(w));

        if (wordCount >= 10 && hasSpecificAction) {
            return {
                score: "High",
                tag: "High SOAR Alignment ✨",
                msg: "✅ Excellent nomination! Specific behavior, location context, and clear SOAR connection.",
                cssClass: "quality-high"
            };
        }

        return {
            score: "Medium",
            tag: "Moderate Quality",
            msg: "Good description! Add a bit more detail on why it matters so it shines on hallway presentation slides.",
            cssClass: "quality-medium"
        };
    }

    if (nominationReasonInput) {
        nominationReasonInput.addEventListener("input", (e) => {
            const analysis = analyzeReasonAlignment(e.target.value);
            if (alignmentBox) alignmentBox.className = `alignment-box ${analysis.cssClass}`;
            if (alignmentBadge) alignmentBadge.textContent = analysis.tag;
            if (alignmentText) alignmentText.textContent = analysis.msg;
        });
    }

    // Auto-fill Example
    const fillSampleBtn = document.getElementById("fillSampleBtn");
    if (fillSampleBtn) {
        fillSampleBtn.addEventListener("click", () => {
            document.getElementById("nominatorRole").value = "Teacher / Staff";
            document.getElementById("nominatorName").value = "Ms. Alvarez (Social Studies)";
            document.getElementById("studentName").value = "Mateo Fernandez";
            document.getElementById("studentGrade").value = "7th Grade";

            const techBtn = document.querySelector(".location-chip-btn[data-location='Technology']");
            if (techBtn) techBtn.click();

            if (nominationReasonInput) {
                nominationReasonInput.value = "Mateo consistently steps up during group lab time to assist ELL classmates by translating instructions and inviting everyone to participate with patience and kindness.";
                nominationReasonInput.dispatchEvent(new Event("input"));
            }
        });
    }

    // Main Form Submission
    const nominationForm = document.getElementById("nominationForm");
    if (nominationForm) {
        nominationForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const studentName = document.getElementById("studentName").value.trim();
            const grade = document.getElementById("studentGrade").value;
            const nominatorName = document.getElementById("nominatorName").value.trim();
            const nominatorRole = document.getElementById("nominatorRole").value;
            const location = locationCategoryInput ? locationCategoryInput.value : "Classroom";
            const pillar = soarPillarInput ? soarPillarInput.value : "S";
            const reason = nominationReasonInput.value.trim();

            const analysis = analyzeReasonAlignment(reason);

            const newNomination = {
                id: `nom-${Date.now()}`,
                studentName,
                grade,
                nominatorName,
                nominatorRole,
                pillar,
                pillarName: getPillarFullName(pillar),
                location,
                reason,
                alignmentScore: analysis.score,
                status: "Pending",
                adminNote: analysis.score === "Low" ? "Automated Alert: Short/Vague or Deficit text flagged for Dean review." : "",
                date: new Date().toISOString().split("T")[0],
                language: currentLang
            };

            nominations.unshift(newNomination);
            saveState();
            syncNominationToCloud(newNomination);

            // Submit Button Debounce Protection
            const submitBtn = nominationForm.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                const origText = submitBtn.innerHTML;
                submitBtn.innerHTML = "⏳ Submitting...";
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origText;
                }, 1200);
            }

            if (typeof confetti === "function" && analysis.score === "High") {
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            }

            alert(`🎉 Thank you ${nominatorName}! Nomination for ${studentName} submitted successfully.`);
            nominationForm.reset();
            selectedExpectation = "";
            selectedExpectationsList = [];
            renderInteractiveLocationMatrix("Classroom");
            if (nominationReasonInput) nominationReasonInput.dispatchEvent(new Event("input"));
        });
    }

    // Quick Add Form Submit
    const quickAddForm = document.getElementById("quickAddForm");
    if (quickAddForm) {
        quickAddForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const teacherName = document.getElementById("quickTeacherName").value.trim();
            const studentName = document.getElementById("quickStudentName").value.trim();
            const grade = document.getElementById("quickStudentGrade").value;
            const location = quickLocation ? quickLocation.value : "Classroom";
            const skill = quickSelectedSkillInput ? (quickSelectedSkillInput.value || "Followed expectations") : "Followed expectations";
            const pillar = quickSelectedPillarInput ? (quickSelectedPillarInput.value || "S") : "S";
            const note = document.getElementById("quickAddNote").value.trim();

            const fullReason = note ? `Demonstrated ${getPillarFullName(pillar)} in the ${location}: "${skill}". Staff Note: ${note}` : `Demonstrated ${getPillarFullName(pillar)} in the ${location}: "${skill}".`;

            const newNom = {
                id: `nom-${Date.now()}`,
                studentName,
                grade,
                nominatorName: teacherName,
                nominatorRole: "Teacher / Staff",
                pillar,
                pillarName: getPillarFullName(pillar),
                location,
                reason: fullReason,
                alignmentScore: "High",
                status: "Pending",
                adminNote: "Teacher Express Quick Add",
                date: new Date().toISOString().split("T")[0],
                language: currentLang
            };

            nominations.unshift(newNom);
            saveState();
            syncNominationToCloud(newNom);
            if (typeof confetti === "function") confetti({ particleCount: 50, origin: { y: 0.6 } });
            alert(`⚡ Quick nomination submitted for ${studentName}!`);
            quickAddForm.reset();
            quickSelectedSkillsList = [];
            if (quickSelectedSkillInput) quickSelectedSkillInput.value = "";
            if (quickSelectedSkillBadge) quickSelectedSkillBadge.innerHTML = `Selected Skills: <em>(Click 1 or more SOAR skill buttons above)</em>`;
            renderQuickSkillChips();
        });
    }

    // Class / Group Batch Add Form Submit
    const classAddForm = document.getElementById("classAddForm");
    if (classAddForm) {
        classAddForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const teacherName = document.getElementById("classTeacherName").value.trim();
            const groupName = document.getElementById("classGroupName").value.trim();
            const rawStudentList = document.getElementById("classStudentList").value.trim();
            const grade = document.getElementById("classGrade").value;
            const location = document.getElementById("classLocation").value;
            const pillar = document.getElementById("classPillar").value;
            const reason = document.getElementById("classReason").value.trim();

            const studentNames = rawStudentList.includes(",") ? 
                rawStudentList.split(",").map(s => s.trim()).filter(s => s.length > 0) : 
                [groupName || rawStudentList];

            let count = 0;
            studentNames.forEach(sName => {
                const newNom = {
                    id: `nom-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
                    studentName: sName,
                    grade,
                    nominatorName: teacherName,
                    nominatorRole: "Teacher / Staff",
                    pillar,
                    pillarName: getPillarFullName(pillar),
                    location,
                    reason: `[${groupName}] ${reason}`,
                    alignmentScore: "High",
                    status: "Pending",
                    adminNote: "Whole Class Batch Submission",
                    date: new Date().toISOString().split("T")[0],
                    language: currentLang
                };
                nominations.unshift(newNom);
                count++;
            });

            saveState();
            if (typeof confetti === "function") confetti({ particleCount: 75, origin: { y: 0.6 } });
            alert(`👥 Successfully submitted batch nominations for ${count} students/groups!`);
            classAddForm.reset();
        });
    }

    function getPillarFullName(code) {
        if (!code) return "SOAR Expectation";
        if (code.includes("/") || code.includes(",")) {
            const parts = code.split(/[\/,]/).map(p => p.trim());
            return parts.map(p => getPillarFullName(p)).join(", ");
        }
        switch(code) {
            case "S": return "Show Respect";
            case "O": return "Own Your Learning & Behavior";
            case "A": return "Act with Integrity";
            case "R": return "Rise Above Conflict";
            default: return "SOAR Expectation";
        }
    }

    function updatePendingBadge() {
        const pendingCount = nominations.filter(n => n.status === "Pending").length;
        const badge = document.getElementById("pendingBadge");
        if (badge) badge.textContent = pendingCount;

        const pendingIdeasCount = rewardIdeas.filter(i => i.status === "Pending Review").length;
        const ideasBadge = document.getElementById("pendingRewardIdeasBadge");
        if (ideasBadge) ideasBadge.textContent = pendingIdeasCount;
    }
    updatePendingBadge();

    // Print QR Poster
    const printPosterBtn = document.getElementById("printPosterBtn");
    if (printPosterBtn) {
        printPosterBtn.addEventListener("click", () => {
            const printContainer = document.getElementById("printContainer");
            if (printContainer) {
                printContainer.innerHTML = `
                    <div class="printable-qr-poster">
                        <h1 style="font-size:2.5rem; color:#8B0000; font-weight:900;">EAST CENTRAL MIDDLE SCHOOL</h1>
                        <h2 style="font-size:1.8rem; color:#FFB703; margin-bottom:1.5rem;">S.O.A.R. STUDENT NOMINATION POSTER</h2>
                        <p style="font-size:1.2rem; margin-bottom:2rem;">Recognize a Cardinal student showing Respect, Ownership, Integrity, or Rising above conflict!</p>
                        <div style="background:#FFF; padding:2rem; border:4px solid #0F172A; display:inline-block; border-radius:16px;">
                            <svg viewBox="0 0 100 100" width="220" height="220">
                                <rect width="100" height="100" fill="#FFFFFF"/>
                                <path d="M10 10 H40 V40 H10 Z M20 20 H30 V30 H20 Z" fill="#0F172A"/>
                                <path d="M60 10 H90 V40 H60 Z M70 20 H80 V30 H70 Z" fill="#0F172A"/>
                                <path d="M10 60 H40 V90 H10 Z M20 70 H30 V80 H20 Z" fill="#0F172A"/>
                                <path d="M50 50 H60 V60 H50 Z M70 50 H90 V60 H70 Z M50 70 H70 V90 H50 Z M80 80 H90 V90 H80 Z" fill="#8B0000"/>
                            </svg>
                            <h3 style="font-size:1.4rem; margin-top:1rem;">Scan with Phone Camera to Nominate!</h3>
                        </div>
                    </div>
                `;
                window.print();
            }
        });
    }

    // FUZZY NAME SIMILARITY ENGINE ("Is this the same student as...?")
    function findSimilarStudentProfiles(studentName, currentNomId) {
        if (!studentName || studentName.length < 3) return null;

        const normCurrent = studentName.toLowerCase().trim();

        const masterProfiles = {};
        nominations.forEach(n => {
            if (n.id === currentNomId) return;
            const norm = n.studentName.toLowerCase().trim();
            if (!masterProfiles[norm]) {
                masterProfiles[norm] = {
                    masterName: n.studentName,
                    grade: n.grade,
                    count: 1
                };
            } else {
                masterProfiles[norm].count++;
            }
        });

        for (const [normMaster, prof] of Object.entries(masterProfiles)) {
            if (normCurrent === normMaster) continue;

            const partsCurrent = normCurrent.split(" ");
            const partsMaster = normMaster.split(" ");

            if (partsCurrent.length >= 1 && partsMaster.length >= 1) {
                if (partsCurrent[0] === partsMaster[0]) {
                    if (partsCurrent.length > 1 && partsMaster.length > 1) {
                        if (partsCurrent[1][0] === partsMaster[1][0]) return prof;
                    } else {
                        return prof;
                    }
                }
            }

            if (getLevenshteinDistance(normCurrent, normMaster) <= 2) {
                return prof;
            }
        }

        return null;
    }

    function getLevenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    window.mergeStudentName = function(nomId, targetMasterName) {
        if (!isDeanAuthenticated) return;
        const nom = nominations.find(n => n.id === nomId);
        if (nom) {
            const oldName = nom.studentName;
            nom.studentName = targetMasterName;
            nom.adminNote = `Merged spelling "${oldName}" ➔ "${targetMasterName}"`;
            saveState();
            renderModerationQueue();
            renderSotmLeaderboard();
            renderSlideDeck();
            renderTicketsGrid();
            alert(`🔗 Merged student name "${oldName}" into "${targetMasterName}"!`);
        }
    };

    window.dismissSimilarityFlag = function(nomId) {
        const nom = nominations.find(n => n.id === nomId);
        if (nom) {
            nom.dismissedSimilarityFlag = true;
            saveState();
            renderModerationQueue();
        }
    };

    // DEAN MODERATION HUB & VIEW MODE (Tile vs List)
    let currentAdminFilter = "all";
    let adminViewMode = "tile"; // "tile" or "list"

    const nominationList = document.getElementById("nominationList");
    const adminSearchInput = document.getElementById("adminSearchInput");
    const viewModeTileBtn = document.getElementById("viewModeTileBtn");
    const viewModeListBtn = document.getElementById("viewModeListBtn");
    const rejectedBannerContainer = document.getElementById("rejectedBannerContainer");

    if (viewModeTileBtn && viewModeListBtn) {
        viewModeTileBtn.addEventListener("click", () => {
            adminViewMode = "tile";
            viewModeTileBtn.classList.add("active");
            viewModeListBtn.classList.remove("active");
            renderModerationQueue();
        });

        viewModeListBtn.addEventListener("click", () => {
            adminViewMode = "list";
            viewModeListBtn.classList.add("active");
            viewModeTileBtn.classList.remove("active");
            renderModerationQueue();
        });
    }

    document.querySelectorAll("[data-filter-status]").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll("[data-filter-status]").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentAdminFilter = pill.getAttribute("data-filter-status");
            renderModerationQueue();
        });
    });

    if (adminSearchInput) adminSearchInput.addEventListener("input", renderModerationQueue);

    window.clearAllRejectedNominations = function() {
        if (!isDeanAuthenticated) return;
        const beforeCount = nominations.length;
        nominations = nominations.filter(n => n.status !== "Rejected");
        saveState();
        renderModerationQueue();
        renderSotmLeaderboard();
        renderSlideDeck();
        renderTicketsGrid();
        const removed = beforeCount - nominations.length;
        alert(removed > 0 ? `🧹 Successfully cleared ${removed} rejected nominations!` : "No rejected nominations found.");
    };

    function renderModerationQueue() {
        if (!nominationList || !isDeanAuthenticated) return;
        nominationList.innerHTML = "";

        const rejectedCount = nominations.filter(n => n.status === "Rejected").length;
        if (rejectedBannerContainer) {
            if (currentAdminFilter === "Rejected" || (rejectedCount > 0 && currentAdminFilter === "all")) {
                rejectedBannerContainer.style.display = "block";
                rejectedBannerContainer.innerHTML = `
                    <div class="clear-rejected-banner">
                        <div>
                            <h4>🚫 Rejected Nominations Queue (${rejectedCount})</h4>
                            <p>Clear out all rejected submissions to keep your database clean and focused on positive recognitions.</p>
                        </div>
                        <button type="button" class="btn btn-primary btn-sm" style="background:#DC2626; border:none;" onclick="clearAllRejectedNominations()">
                            🧹 Clear All ${rejectedCount} Rejected Entries Now
                        </button>
                    </div>
                `;
            } else {
                rejectedBannerContainer.style.display = "none";
                rejectedBannerContainer.innerHTML = "";
            }
        }

        const query = adminSearchInput ? adminSearchInput.value.toLowerCase().trim() : "";

        const filtered = nominations.filter(nom => {
            const matchesFilter = currentAdminFilter === "all" ||
                (currentAdminFilter === "Needs Revision" ? (nom.status === "Needs Revision" || nom.alignmentScore === "Low") : nom.status === currentAdminFilter);
            
            const matchesQuery = !query || 
                nom.studentName.toLowerCase().includes(query) ||
                nom.nominatorName.toLowerCase().includes(query) ||
                nom.reason.toLowerCase().includes(query);

            return matchesFilter && matchesQuery;
        });

        if (filtered.length === 0) {
            nominationList.className = "nomination-cards-grid";
            nominationList.innerHTML = `
                <div class="empty-queue" style="grid-column: 1/-1; text-align: center; padding: 3rem; background: white; border-radius: 12px;">
                    <p style="font-size: 1.2rem; font-weight: 700; color: #475569;">No nominations match your current filter.</p>
                </div>
            `;
            return;
        }

        if (adminViewMode === "list") {
            // LIST VIEW (TABLE)
            nominationList.className = "nomination-list-table-wrapper";
            
            let tableHtml = `
                <table class="nomination-list-table">
                    <thead>
                        <tr>
                            <th>Student & Grade</th>
                            <th>Nominator</th>
                            <th>SOAR Pillar & Location</th>
                            <th>Reason / Story</th>
                            <th>Quality</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            filtered.forEach(nom => {
                const similarityMatch = !nom.dismissedSimilarityFlag ? findSimilarStudentProfiles(nom.studentName, nom.id) : null;
                const statusColor = nom.status === 'Approved' ? '#065F46' : (nom.status === 'Rejected' ? '#991B1B' : '#92400E');
                const statusBg = nom.status === 'Approved' ? '#D1FAE5' : (nom.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7');

                tableHtml += `
                    <tr>
                        <td>
                            <strong>${nom.studentName}</strong>
                            <div style="font-size:0.75rem; color:#64748B;">${nom.grade}</div>
                            ${similarityMatch ? `
                                <div style="font-size:0.72rem; color:#D97706; font-weight:700; margin-top:0.2rem;">
                                    ⚠️ Similar to ${similarityMatch.masterName}
                                    <button class="btn btn-sm btn-ghost" style="padding:0.1rem 0.3rem; font-size:0.68rem;" onclick="mergeStudentName('${nom.id}', '${similarityMatch.masterName}')">Merge</button>
                                </div>
                            ` : ''}
                        </td>
                        <td>
                            <div>${nom.nominatorName}</div>
                            <div style="font-size:0.75rem; color:#64748B;">${nom.nominatorRole}</div>
                        </td>
                        <td>
                            <span class="prompt-chip" style="background:#0F172A; color:#FFF; font-size:0.72rem;">${nom.pillar}</span>
                            <div style="font-size:0.75rem; color:#475569; margin-top:0.2rem;">📍 ${nom.location}</div>
                        </td>
                        <td style="max-width:300px;">
                            <div style="font-size:0.8rem; line-height:1.4; color:#334155;">"${nom.reason.length > 110 ? nom.reason.substr(0, 110) + '...' : nom.reason}"</div>
                            ${nom.adminNote ? `<div style="font-size:0.72rem; color:#991B1B; margin-top:0.2rem;">Note: ${nom.adminNote}</div>` : ''}
                        </td>
                        <td>
                            <span class="prompt-chip" style="border-color:${nom.alignmentScore==='High'?'#10B981':(nom.alignmentScore==='Low'?'#EF4444':'#F59E0B')}; font-size:0.72rem;">
                                ${nom.alignmentScore}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge" style="background:${statusBg}; color:${statusColor}; font-size:0.72rem;">
                                ${nom.status}
                            </span>
                        </td>
                        <td style="white-space:nowrap;">
                            <div style="display:flex; gap:0.3rem;">
                                ${nom.status !== 'Approved' ? `<button class="btn btn-primary btn-sm" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="updateNomStatus('${nom.id}', 'Approved')">✅</button>` : ''}
                                <button class="btn btn-ghost btn-sm" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="openEditModal('${nom.id}')">✏️</button>
                                ${nom.status !== 'Rejected' ? `<button class="btn btn-ghost btn-sm" style="padding:0.25rem 0.55rem; font-size:0.75rem; color:#EF4444;" onclick="updateNomStatus('${nom.id}', 'Rejected')">❌</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });

            tableHtml += `
                    </tbody>
                </table>
            `;

            nominationList.innerHTML = tableHtml;
        } else {
            // TILE VIEW (CARDS GRID)
            nominationList.className = "nomination-cards-grid";

            filtered.forEach(nom => {
                const similarityMatch = !nom.dismissedSimilarityFlag ? findSimilarStudentProfiles(nom.studentName, nom.id) : null;

                const card = document.createElement("div");
                card.className = `nom-card pillar-${nom.pillar}`;
                card.innerHTML = `
                    <div class="nom-card-header">
                        <div>
                            <div class="student-title">${nom.studentName}</div>
                            <div class="nom-meta">${nom.grade} • Nominated by <strong>${nom.nominatorName}</strong> (${nom.nominatorRole})</div>
                        </div>
                        <span class="status-badge ${nom.status.replace(/\s+/g, '-')}">${nom.status}</span>
                    </div>

                    ${similarityMatch ? `
                        <div class="duplicate-flag-banner">
                            ⚠️ <strong>Name Similarity Alert:</strong> Is this the same student as <strong>"${similarityMatch.masterName}"</strong> (${similarityMatch.grade} • ${similarityMatch.count} nominations)?
                            <div style="margin-top:0.4rem; display:flex; gap:0.4rem;">
                                <button class="btn btn-sm btn-secondary" onclick="mergeStudentName('${nom.id}', '${similarityMatch.masterName}')">🔗 Merge to "${similarityMatch.masterName}"</button>
                                <button class="btn btn-sm btn-ghost" onclick="dismissSimilarityFlag('${nom.id}')">Keep Separate</button>
                            </div>
                        </div>
                    ` : ''}

                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                        <span class="prompt-chip" style="background:#0F172A; color:#FFF;">${nom.pillar} - ${nom.pillarName}</span>
                        <span class="prompt-chip">📍 ${nom.location}</span>
                        <span class="prompt-chip" style="border-color:${nom.alignmentScore==='High'?'#10B981':(nom.alignmentScore==='Low'?'#EF4444':'#F59E0B')}">
                            Quality: ${nom.alignmentScore}
                        </span>
                    </div>

                    <div class="nom-reason-box">
                        "${nom.reason}"
                    </div>

                    ${nom.adminNote ? `<div style="font-size: 0.78rem; color: #991B1B; background: #FEE2E2; padding: 0.4rem 0.6rem; border-radius: 4px; margin-bottom: 0.75rem;"><strong>Admin Note:</strong> ${nom.adminNote}</div>` : ''}

                    <div class="admin-card-actions">
                        ${nom.status !== 'Approved' ? `<button class="btn btn-primary btn-sm" onclick="updateNomStatus('${nom.id}', 'Approved')">✅ Approve</button>` : ''}
                        <button class="btn btn-ghost btn-sm" onclick="openEditModal('${nom.id}')">✏️ Edit Wording</button>
                        ${nom.status !== 'Rejected' ? `<button class="btn btn-ghost btn-sm" style="color:#EF4444;" onclick="updateNomStatus('${nom.id}', 'Rejected')">❌ Reject</button>` : ''}
                    </div>
                `;
                nominationList.appendChild(card);
            });
        }
    }

    window.updateNomStatus = function(id, newStatus) {
        if (!isDeanAuthenticated) return;
        const target = nominations.find(n => n.id === id);
        if (target) {
            target.status = newStatus;
            saveState();
            renderModerationQueue();
            renderSotmLeaderboard();
            renderSlideDeck();
            renderTicketsGrid();
        }
    };

    const batchApproveBtn = document.getElementById("batchApproveBtn");
    if (batchApproveBtn) {
        batchApproveBtn.addEventListener("click", () => {
            if (!isDeanAuthenticated) return;
            let count = 0;
            nominations.forEach(n => {
                if (n.status === "Pending" && n.alignmentScore !== "Low") {
                    n.status = "Approved";
                    count++;
                }
            });
            saveState();
            renderModerationQueue();
            renderSotmLeaderboard();
            alert(`Approved ${count} high-quality pending nominations!`);
        });
    }

    const clearRejectedBtn = document.getElementById("clearRejectedBtn");
    if (clearRejectedBtn) {
        clearRejectedBtn.addEventListener("click", () => {
            if (!isDeanAuthenticated) return;
            const beforeCount = nominations.length;
            nominations = nominations.filter(n => n.status !== "Rejected");
            saveState();
            renderModerationQueue();
            renderSotmLeaderboard();
            renderSlideDeck();
            renderTicketsGrid();
            const removed = beforeCount - nominations.length;
            alert(removed > 0 ? `🧹 Cleared ${removed} rejected nominations!` : "No rejected nominations found.");
        });
    }

    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            if (!isDeanAuthenticated) return;
            let csv = "ID,Student Name,Grade,Nominator,Pillar,Location,Reason,Alignment,Status,Date\n";
            nominations.forEach(n => {
                csv += `"${n.id}","${n.studentName}","${n.grade}","${n.nominatorName}","${n.pillar}","${n.location}","${n.reason.replace(/"/g, '""')}","${n.alignmentScore}","${n.status}","${n.date}"\n`;
            });
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ECMS_SOAR_Nominations_${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
        });
    }

    // STUDENT OF THE MONTH LEADERBOARD ENGINE (SPECIFIC MONTH, QUARTER, SEMESTER & YEAR FILTERS)
    const sotmLeaderboardContainer = document.getElementById("sotmLeaderboardContainer");
    const sotmMonthSelect = document.getElementById("sotmMonthSelect");
    const sotmQuarterSelect = document.getElementById("sotmQuarterSelect");
    const sotmSemesterSelect = document.getElementById("sotmSemesterSelect");

    const sotmMonthSelectorGroup = document.getElementById("sotmMonthSelectorGroup");
    const sotmQuarterSelectorGroup = document.getElementById("sotmQuarterSelectorGroup");
    const sotmSemesterSelectorGroup = document.getElementById("sotmSemesterSelectorGroup");

    if (sotmMonthSelect) {
        const now = new Date();
        const curY = now.getFullYear();
        const curM = String(now.getMonth() + 1).padStart(2, '0');
        const defaultVal = `${curY}-${curM}`;
        if (Array.from(sotmMonthSelect.options).some(o => o.value === defaultVal)) {
            sotmMonthSelect.value = defaultVal;
        }
    }

    document.querySelectorAll("[data-sotm-mode]").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll("[data-sotm-mode]").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            sotmSelectedMode = pill.getAttribute("data-sotm-mode");

            if (sotmMonthSelectorGroup) sotmMonthSelectorGroup.style.display = sotmSelectedMode === "month" ? "flex" : "none";
            if (sotmQuarterSelectorGroup) sotmQuarterSelectorGroup.style.display = sotmSelectedMode === "quarter" ? "flex" : "none";
            if (sotmSemesterSelectorGroup) sotmSemesterSelectorGroup.style.display = sotmSelectedMode === "semester" ? "flex" : "none";

            renderSotmLeaderboard();
        });
    });

    if (sotmMonthSelect) sotmMonthSelect.addEventListener("change", renderSotmLeaderboard);
    if (sotmQuarterSelect) sotmQuarterSelect.addEventListener("change", renderSotmLeaderboard);
    if (sotmSemesterSelect) sotmSemesterSelect.addEventListener("change", renderSotmLeaderboard);

    document.querySelectorAll("[data-sotm-grade]").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll("[data-sotm-grade]").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            sotmSelectedGrade = pill.getAttribute("data-sotm-grade");
            renderSotmLeaderboard();
        });
    });

    function isNominationInTimeframe(nomDateStr) {
        if (!nomDateStr || sotmSelectedMode === "year") return true;

        if (sotmSelectedMode === "month") {
            const targetMonth = sotmMonthSelect ? sotmMonthSelect.value : "2026-08";
            return nomDateStr.startsWith(targetMonth);
        }

        if (sotmSelectedMode === "quarter") {
            const q = sotmQuarterSelect ? sotmQuarterSelect.value : "Q1";
            if (q === "Q1") return nomDateStr.startsWith("2026-08") || nomDateStr.startsWith("2026-09") || nomDateStr.startsWith("2026-10");
            if (q === "Q2") return nomDateStr.startsWith("2026-11") || nomDateStr.startsWith("2026-12") || nomDateStr.startsWith("2027-01");
            if (q === "Q3") return nomDateStr.startsWith("2027-02") || nomDateStr.startsWith("2027-03");
            if (q === "Q4") return nomDateStr.startsWith("2027-04") || nomDateStr.startsWith("2027-05");
        }

        if (sotmSelectedMode === "semester") {
            const sem = sotmSemesterSelect ? sotmSemesterSelect.value : "S1";
            if (sem === "S1") return nomDateStr.startsWith("2026-08") || nomDateStr.startsWith("2026-09") || nomDateStr.startsWith("2026-10") || nomDateStr.startsWith("2026-11") || nomDateStr.startsWith("2026-12");
            if (sem === "S2") return nomDateStr.startsWith("2027-01") || nomDateStr.startsWith("2027-02") || nomDateStr.startsWith("2027-03") || nomDateStr.startsWith("2027-04") || nomDateStr.startsWith("2027-05");
        }

        return true;
    }

    function renderSotmLeaderboard() {
        if (!sotmLeaderboardContainer || !isDeanAuthenticated) return;
        sotmLeaderboardContainer.innerHTML = "";

        const studentAgg = {};
        nominations.forEach(nom => {
            if (!isNominationInTimeframe(nom.date)) return;
            if (sotmSelectedGrade !== "all" && nom.grade !== sotmSelectedGrade) return;

            const nameKey = nom.studentName.toLowerCase().trim();
            if (!studentAgg[nameKey]) {
                studentAgg[nameKey] = {
                    studentName: nom.studentName,
                    grade: nom.grade,
                    totalCount: 0,
                    approvedCount: 0,
                    pillars: { S: 0, O: 0, A: 0, R: 0 },
                    nominators: new Set(),
                    stories: []
                };
            }

            studentAgg[nameKey].totalCount++;
            if (nom.status === "Approved") studentAgg[nameKey].approvedCount++;
            if (nom.pillar && studentAgg[nameKey].pillars[nom.pillar] !== undefined) {
                studentAgg[nameKey].pillars[nom.pillar]++;
            }
            studentAgg[nameKey].nominators.add(nom.nominatorName);
            studentAgg[nameKey].stories.push({
                nominator: nom.nominatorName,
                pillar: nom.pillar,
                reason: nom.reason,
                date: nom.date
            });
        });

        const sortedStudents = Object.values(studentAgg).sort((a, b) => b.totalCount - a.totalCount);

        if (sortedStudents.length === 0) {
            let label = "Selected Month";
            if (sotmSelectedMode === "month" && sotmMonthSelect) {
                label = sotmMonthSelect.options[sotmMonthSelect.selectedIndex].text;
            } else if (sotmSelectedMode === "quarter" && sotmQuarterSelect) {
                label = sotmQuarterSelect.options[sotmQuarterSelect.selectedIndex].text;
            }
            sotmLeaderboardContainer.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:3rem; background:#FFF; border-radius:12px;">
                    <h3>No Nominations Found for ${label} and Selected Grade Level</h3>
                    <p style="color:#64748B;">Try selecting a different month from the dropdown above or submitting a new nomination!</p>
                </div>
            `;
            return;
        }

        sortedStudents.slice(0, 10).forEach((st, idx) => {
            const rank = idx + 1;
            const isAwarded = !!awardedSotmStudents[st.studentName.toLowerCase().trim()];
            const isFavoritedCapAlert = st.totalCount >= 4;

            const card = document.createElement("div");
            card.className = `sotm-card ${rank === 1 ? 'rank-1' : ''} ${isAwarded ? 'awarded' : ''}`;

            card.innerHTML = `
                <div class="sotm-card-top">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <div class="sotm-rank-badge">#${rank}</div>
                        <div>
                            <div class="sotm-student-name">${st.studentName}</div>
                            <div style="font-size:0.8rem; color:#64748B; font-weight:700;">${st.grade} • ${st.nominators.size} Staff Nominators</div>
                        </div>
                    </div>
                    <span class="sotm-nom-count">${st.totalCount} Nominations</span>
                </div>

                ${isFavoritedCapAlert ? `
                    <div style="background:#FFFBEB; border:1px solid #F59E0B; border-radius:6px; padding:0.4rem 0.6rem; font-size:0.75rem; color:#92400E; margin-bottom:0.6rem;">
                        <strong>Equity Shield:</strong> Highly recognized student (${st.totalCount} nominations). Ensure other students in ${st.grade} receive equal recognition opportunity!
                    </div>
                ` : ''}

                <div class="sotm-pillar-counts">
                    <span class="pillar-count-chip" style="background:#DC143C;">S: ${st.pillars.S}</span>
                    <span class="pillar-count-chip" style="background:#D97706;">O: ${st.pillars.O}</span>
                    <span class="pillar-count-chip" style="background:#0D9488;">A: ${st.pillars.A}</span>
                    <span class="pillar-count-chip" style="background:#2563EB;">R: ${st.pillars.R}</span>
                </div>

                <div class="sotm-reasons-preview">
                    <strong>Faculty Commendations (${st.stories.length}):</strong>
                    ${st.stories.map(s => `
                        <div class="sotm-reason-item">
                            <strong>${s.nominator} (${s.pillar}):</strong> "${s.reason}"
                        </div>
                    `).join('')}
                </div>

                <button type="button" class="btn ${isAwarded ? 'btn-secondary' : 'btn-primary'} btn-sm" style="width:100%; ${isAwarded ? 'background:#10B981;' : ''}" onclick="toggleAwardSotm('${st.studentName.replace(/'/g, "\\'")}', '${st.grade}')">
                    ${isAwarded ? '🌟 Awarded Student of the Month ✅' : '🌟 Award Student of the Month'}
                </button>

                <div class="sotm-cert-actions">
                    <button type="button" class="btn btn-ghost btn-sm" style="flex:1;" onclick="printSotmCertificate('${st.studentName.replace(/'/g, "\\'")}', '${st.grade}', 'en')">
                        🖨️ Cert (EN)
                    </button>
                    <button type="button" class="btn btn-ghost btn-sm" style="flex:1;" onclick="printSotmCertificate('${st.studentName.replace(/'/g, "\\'")}', '${st.grade}', 'es')">
                        📜 Certificado (ES)
                    </button>
                </div>
            `;
            sotmLeaderboardContainer.appendChild(card);
        });
    }

    window.toggleAwardSotm = function(studentName, grade) {
        if (!isDeanAuthenticated) return;
        const key = studentName.toLowerCase().trim();
        if (awardedSotmStudents[key]) {
            delete awardedSotmStudents[key];
        } else {
            awardedSotmStudents[key] = { studentName, grade, awardedDate: new Date().toISOString().split("T")[0] };
            if (typeof confetti === "function") confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        }
        saveState();
        renderSotmLeaderboard();
    };

    // FORMAL BILINGUAL STUDENT OF THE MONTH CERTIFICATE PRINTING
    window.printSotmCertificate = function(studentName, grade, lang = "en") {
        if (!isDeanAuthenticated) return;
        const printContainer = document.getElementById("printContainer");
        if (!printContainer) return;

        let monthLabel = new Date().toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" });
        if (sotmSelectedMode === "month" && sotmMonthSelect) {
            const [y, m] = sotmMonthSelect.value.split("-");
            const d = new Date(parseInt(y), parseInt(m) - 1, 1);
            monthLabel = d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" });
        }

        const currentStudentNoms = nominations.filter(n => n.studentName.toLowerCase().trim() === studentName.toLowerCase().trim());
        const sampleReason = currentStudentNoms.length > 0 ? currentStudentNoms[0].reason : "Consistently upholding S.O.A.R. core values across East Central MS campus.";

        let html = "";
        if (lang === "es") {
            html = `
                <div class="printable-sotm-certificate">
                    <div>
                        <div class="cert-school-name">ESCUELA SECUNDARIA EAST CENTRAL</div>
                        <div class="cert-award-title">CERTIFICADO DE RECONOCIMIENTO: ESTUDIANTE DEL MES</div>
                    </div>

                    <div>
                        <div class="cert-recipient-label">ESTE CERTIFICADO ES CONCEDIDO CON ORGULLO A</div>
                        <div class="cert-recipient-name">${studentName}</div>
                        <div class="cert-grade-tag">GRADO: ${grade.toUpperCase()} • MES: ${monthLabel.toUpperCase()}</div>
                    </div>

                    <div class="cert-body-text">
                        "Por demostrar de manera sobresaliente los valores fundamentales S.O.A.R. (Mostrar Respeto, Asumir Responsabilidad, Actuar con Integridad y Superar Conflictos) en East Central Middle School."
                        <br><br>
                        <strong style="font-family:var(--font-main); font-size:0.9rem;">Mención de la Facultad:</strong> "${sampleReason}"
                    </div>

                    <div class="cert-footer-row">
                        <div class="cert-sig-box">
                            <div class="cert-sig-line"></div>
                            <div class="cert-sig-title">DECANO DE ESTUDIANTES</div>
                        </div>
                        <div style="font-weight:800; font-size:0.85rem; color:#8B0000; letter-spacing:0.05em;">
                            EAST CENTRAL CARDINALS • S.O.A.R.
                        </div>
                        <div class="cert-sig-box">
                            <div class="cert-sig-line"></div>
                            <div class="cert-sig-title">DIRECTOR / PRINCIPAL</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html = `
                <div class="printable-sotm-certificate">
                    <div>
                        <div class="cert-school-name">EAST CENTRAL MIDDLE SCHOOL</div>
                        <div class="cert-award-title">STUDENT OF THE MONTH COMMENDATION CERTIFICATE</div>
                    </div>

                    <div>
                        <div class="cert-recipient-label">THIS FORMAL AWARD IS PROUDLY PRESENTED TO</div>
                        <div class="cert-recipient-name">${studentName}</div>
                        <div class="cert-grade-tag">GRADE LEVEL: ${grade.toUpperCase()} • MONTH: ${monthLabel.toUpperCase()}</div>
                    </div>

                    <div class="cert-body-text">
                        "For exemplary dedication in demonstrating our core S.O.A.R. values (Show Respect, Own Your Learning, Act with Integrity, and Rise Above Conflict) across East Central Middle School."
                        <br><br>
                        <strong style="font-family:var(--font-main); font-size:0.9rem;">Faculty Commendation:</strong> "${sampleReason}"
                    </div>

                    <div class="cert-footer-row">
                        <div class="cert-sig-box">
                            <div class="cert-sig-line"></div>
                            <div class="cert-sig-title">DEAN OF STUDENTS</div>
                        </div>
                        <div style="font-weight:800; font-size:0.85rem; color:#8B0000; letter-spacing:0.05em;">
                            EAST CENTRAL CARDINALS • S.O.A.R.
                        </div>
                        <div class="cert-sig-box">
                            <div class="cert-sig-line"></div>
                            <div class="cert-sig-title">SCHOOL PRINCIPAL</div>
                        </div>
                    </div>
                </div>
            `;
        }

        printContainer.innerHTML = html;
        window.print();
    };

    // REDESIGNED SOAR BUCKS TICKET STUDIO ENGINE
    const ticketModeStudentsBtn = document.getElementById("ticketModeStudentsBtn");
    const ticketModeBlankBtn = document.getElementById("ticketModeBlankBtn");
    const ticketValueSelect = document.getElementById("ticketValueSelect");
    const ticketDensitySelect = document.getElementById("ticketDensitySelect");
    const ticketsSheetPreview = document.getElementById("ticketsSheetPreview");
    const approvedTicketCount = document.getElementById("approvedTicketCount");
    const selectAllTicketsBtn = document.getElementById("selectAllTicketsBtn");
    const deselectAllTicketsBtn = document.getElementById("deselectAllTicketsBtn");
    const selectedTicketCountLabel = document.getElementById("selectedTicketCountLabel");
    const studentTicketSelectionBar = document.getElementById("studentTicketSelectionBar");

    if (ticketModeStudentsBtn && ticketModeBlankBtn) {
        ticketModeStudentsBtn.addEventListener("click", () => {
            ticketStudioMode = "students";
            ticketModeStudentsBtn.classList.add("active");
            ticketModeBlankBtn.classList.remove("active");
            if (studentTicketSelectionBar) studentTicketSelectionBar.style.display = "flex";
            renderTicketsGrid();
        });

        ticketModeBlankBtn.addEventListener("click", () => {
            ticketStudioMode = "blank";
            ticketModeBlankBtn.classList.remove("active");
            ticketModeStudentsBtn.classList.remove("active");
            if (studentTicketSelectionBar) studentTicketSelectionBar.style.display = "none";
            renderTicketsGrid();
        });
    }

    if (ticketValueSelect) ticketValueSelect.addEventListener("change", renderTicketsGrid);
    if (ticketDensitySelect) ticketDensitySelect.addEventListener("change", renderTicketsGrid);

    if (selectAllTicketsBtn) {
        selectAllTicketsBtn.addEventListener("click", () => {
            const approvedList = nominations.filter(n => n.status === "Approved");
            approvedList.forEach(n => selectedTicketIds.add(n.id));
            renderTicketsGrid();
        });
    }

    if (deselectAllTicketsBtn) {
        deselectAllTicketsBtn.addEventListener("click", () => {
            selectedTicketIds.clear();
            renderTicketsGrid();
        });
    }

    function getPillarColorCode(code) {
        switch(code) {
            case "S": return "#DC143C";
            case "O": return "#D97706";
            case "A": return "#0D9488";
            case "R": return "#2563EB";
            default: return "#8B0000";
        }
    }

    function renderTicketsGrid() {
        if (!ticketsSheetPreview || !isDeanAuthenticated) return;

        const approvedList = nominations.filter(n => n.status === "Approved");
        if (approvedTicketCount) approvedTicketCount.textContent = approvedList.length;

        if (selectedTicketIds.size === 0 && approvedList.length > 0) {
            approvedList.forEach(n => selectedTicketIds.add(n.id));
        }

        const valueText = ticketValueSelect ? ticketValueSelect.value : "1 SOAR POINT";
        const density = ticketDensitySelect ? parseInt(ticketDensitySelect.value) : 8;

        ticketsSheetPreview.className = `printable-tickets-grid grid-${density}`;
        ticketsSheetPreview.innerHTML = "";

        if (ticketStudioMode === "students") {
            if (selectedTicketCountLabel) selectedTicketCountLabel.textContent = `Selected: ${selectedTicketIds.size} of ${approvedList.length} tickets`;

            if (approvedList.length === 0) {
                ticketsSheetPreview.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #FFF; border-radius: 12px;">
                        <h3>No Approved Student Nominations Yet</h3>
                        <p style="color:#64748B;">Approve nominations in the Approval Queue or switch to Blank Cut-Out Bucks mode above!</p>
                    </div>
                `;
                return;
            }

            const targetList = approvedList.filter(n => selectedTicketIds.has(n.id));

            targetList.forEach((nom, idx) => {
                const color = getPillarColorCode(nom.pillar);
                const serial = `ECMS-${nom.pillar}-${1000 + idx}`;

                const buck = document.createElement("div");
                buck.className = "soar-currency-buck";
                buck.innerHTML = `
                    <input type="checkbox" class="buck-checkbox" ${selectedTicketIds.has(nom.id) ? 'checked' : ''} data-id="${nom.id}" title="Select for printing">
                    
                    <div class="buck-header">
                        <span class="buck-brand-tag">
                            <svg viewBox="0 0 100 100" width="16" height="16"><circle cx="50" cy="50" r="46" fill="#8B0000"/><path d="M25 40 L65 15 L85 45 L65 75 L35 75 L20 55 Z" fill="#DC143C"/></svg>
                            EAST CENTRAL MS
                        </span>
                        <span class="buck-value-badge">${valueText}</span>
                    </div>

                    <div class="buck-student-name">${nom.studentName}</div>
                    <div>
                        <span class="buck-pillar-pill" style="background:${color}">${nom.pillar} - ${nom.pillarName}</span>
                        <span style="font-size:0.7rem; color:#64748B; font-weight:700;">📍 ${nom.location}</span>
                    </div>

                    <div class="buck-reason-text">
                        "${nom.reason}"
                    </div>

                    <div class="buck-footer">
                        <div>Staff: <strong>${nom.nominatorName}</strong></div>
                        <div style="font-family:monospace; font-weight:700;">${serial}</div>
                    </div>
                `;

                buck.querySelector(".buck-checkbox").addEventListener("change", (e) => {
                    if (e.target.checked) selectedTicketIds.add(nom.id);
                    else selectedTicketIds.delete(nom.id);
                    if (selectedTicketCountLabel) selectedTicketCountLabel.textContent = `Selected: ${selectedTicketIds.size} of ${approvedList.length} tickets`;
                });

                ticketsSheetPreview.appendChild(buck);
            });
        } else {
            for (let i = 0; i < density; i++) {
                const serial = `ECMS-BLANK-${2000 + i}`;
                const buck = document.createElement("div");
                buck.className = "soar-currency-buck";
                buck.innerHTML = `
                    <div class="buck-header">
                        <span class="buck-brand-tag">
                            <svg viewBox="0 0 100 100" width="16" height="16"><circle cx="50" cy="50" r="46" fill="#8B0000"/><path d="M25 40 L65 15 L85 45 L65 75 L35 75 L20 55 Z" fill="#DC143C"/></svg>
                            EAST CENTRAL MS BUCK
                        </span>
                        <span class="buck-value-badge">${valueText}</span>
                    </div>

                    <div style="margin-bottom:0.4rem;">
                        <span style="font-size:0.7rem; font-weight:800; color:#475569;">STUDENT NAME:</span>
                        <div style="border-bottom: 1.5px solid #0F172A; height: 18px; margin-top:2px;"></div>
                    </div>

                    <div style="font-size:0.7rem; font-weight:800; color:#475569; margin-bottom:0.4rem;">
                        DEMONSTRATED PILLAR: &nbsp; [S] &nbsp; [O] &nbsp; [A] &nbsp; [R]
                    </div>

                    <div style="margin-bottom:0.4rem;">
                        <span style="font-size:0.7rem; font-weight:800; color:#475569;">LOCATION & REASON:</span>
                        <div style="border-bottom: 1px dashed #94A3B8; height: 16px; margin-top:2px;"></div>
                    </div>

                    <div class="buck-footer">
                        <div>STAFF SIG: <span class="buck-sig-line"></span></div>
                        <div style="font-family:monospace; font-weight:700;">${serial}</div>
                    </div>
                `;
                ticketsSheetPreview.appendChild(buck);
            }
        }
    }

    const printTicketsBtn = document.getElementById("printTicketsBtn");
    if (printTicketsBtn) {
        printTicketsBtn.addEventListener("click", () => {
            if (!isDeanAuthenticated) return;
            const printContainer = document.getElementById("printContainer");
            if (printContainer && ticketsSheetPreview) {
                printContainer.innerHTML = ticketsSheetPreview.outerHTML;
                window.print();
            }
        });
    }

    // PROTECTED SLIDE DECK STUDIO
    const slideStage = document.getElementById("activeSlideStage");
    const slideThumbnails = document.getElementById("slideThumbnails");
    const slideThemeSelect = document.getElementById("slideThemeSelect");
    const slideCountText = document.getElementById("slideCountText");
    const slideIndexIndicator = document.getElementById("slideIndexIndicator");

    function renderSlideDeck() {
        if (!slideStage || !isDeanAuthenticated) return;

        const approvedList = nominations.filter(n => n.status === "Approved");
        if (slideCountText) slideCountText.textContent = approvedList.length;

        if (approvedList.length === 0) {
            slideStage.innerHTML = `
                <div style="text-align: center; margin: auto;">
                    <h2>No Approved Nominations Yet</h2>
                    <p style="opacity: 0.8;">Approve student nominations in the Approval Queue to generate presentation slides.</p>
                </div>
            `;
            if (slideThumbnails) slideThumbnails.innerHTML = "";
            return;
        }

        if (activeSlideIndex >= approvedList.length) activeSlideIndex = 0;
        const activeNom = approvedList[activeSlideIndex];

        const currentTheme = slideThemeSelect ? slideThemeSelect.value : "cardinal-dark";
        slideStage.className = `slide-stage ${currentTheme}`;

        slideStage.innerHTML = `
            <div class="slide-top-bar">
                <div class="slide-school-tag">
                    <svg viewBox="0 0 100 100" width="32" height="32"><circle cx="50" cy="50" r="46" fill="#8B0000"/><path d="M25 40 L65 15 L85 45 L65 75 L35 75 L20 55 Z" fill="#DC143C"/></svg>
                    East Central MS • S.O.A.R. Spotlight
                </div>
                <div class="slide-pillar-badge">
                    ${activeNom.pillar} - ${activeNom.pillarName}
                </div>
            </div>

            <div class="slide-body">
                <div class="slide-student-name">${activeNom.studentName}</div>
                <div class="slide-grade-tag">${activeNom.grade} • Demonstrated in the <strong>${activeNom.location}</strong></div>
                <div class="slide-quote">"${activeNom.reason}"</div>
            </div>

            <div class="slide-footer">
                <div>Nominated by: <strong>${activeNom.nominatorName}</strong> (${activeNom.nominatorRole})</div>
                <div>East Central Middle School Cardinals</div>
            </div>
        `;

        if (slideIndexIndicator) slideIndexIndicator.textContent = `Slide ${activeSlideIndex + 1} of ${approvedList.length}`;

        if (slideThumbnails) {
            slideThumbnails.innerHTML = "";
            approvedList.forEach((nom, idx) => {
                const thumb = document.createElement("div");
                thumb.className = `thumb-item ${idx === activeSlideIndex ? 'active' : ''}`;
                thumb.innerHTML = `
                    <strong style="color:#FFB703">${nom.studentName}</strong><br>
                    <span style="opacity:0.8">${nom.pillar} • ${nom.grade}</span>
                `;
                thumb.addEventListener("click", () => {
                    activeSlideIndex = idx;
                    renderSlideDeck();
                });
                slideThumbnails.appendChild(thumb);
            });
        }
    }

    if (slideThemeSelect) slideThemeSelect.addEventListener("change", renderSlideDeck);

    const prevSlideBtn = document.getElementById("prevSlideBtn");
    if (prevSlideBtn) {
        prevSlideBtn.addEventListener("click", () => {
            const approvedList = nominations.filter(n => n.status === "Approved");
            if (approvedList.length === 0) return;
            activeSlideIndex = (activeSlideIndex - 1 + approvedList.length) % approvedList.length;
            renderSlideDeck();
        });
    }

    const nextSlideBtn = document.getElementById("nextSlideBtn");
    if (nextSlideBtn) {
        nextSlideBtn.addEventListener("click", () => {
            const approvedList = nominations.filter(n => n.status === "Approved");
            if (approvedList.length === 0) return;
            activeSlideIndex = (activeSlideIndex + 1) % approvedList.length;
            renderSlideDeck();
        });
    }

    const launchSlideshowBtn = document.getElementById("launchSlideshowBtn");
    const fullscreenSlideshow = document.getElementById("fullscreenSlideshow");
    const fullscreenSlideContainer = document.getElementById("fullscreenSlideContainer");
    const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");

    if (launchSlideshowBtn) {
        launchSlideshowBtn.addEventListener("click", () => {
            if (!isDeanAuthenticated) return;
            const approvedList = nominations.filter(n => n.status === "Approved");
            if (approvedList.length === 0) {
                alert("No approved slides available for presentation mode.");
                return;
            }
            if (fullscreenSlideshow) fullscreenSlideshow.classList.add("active");
            renderFullscreenSlide();
            
            if (!autoPlayInterval) {
                autoPlayInterval = setInterval(() => {
                    activeSlideIndex = (activeSlideIndex + 1) % approvedList.length;
                    renderFullscreenSlide();
                }, 5000);
            }
        });
    }

    function renderFullscreenSlide() {
        const approvedList = nominations.filter(n => n.status === "Approved");
        if (approvedList.length === 0 || !fullscreenSlideContainer) return;
        const nom = approvedList[activeSlideIndex];

        fullscreenSlideContainer.innerHTML = `
            <div class="slide-stage cardinal-dark" style="width: 85vw; max-width: 1200px;">
                <div class="slide-top-bar">
                    <div class="slide-school-tag">East Central MS • S.O.A.R. Presentation</div>
                    <div class="slide-pillar-badge">${nom.pillar} - ${nom.pillarName}</div>
                </div>
                <div class="slide-body">
                    <div class="slide-student-name">${nom.studentName}</div>
                    <div class="slide-grade-tag">${nom.grade} • ${nom.location}</div>
                    <div class="slide-quote">"${nom.reason}"</div>
                </div>
                <div class="slide-footer">
                    <div>Nominated by: ${nom.nominatorName}</div>
                    <div>Cardinal Recognition Program</div>
                </div>
            </div>
        `;
    }

    if (exitFullscreenBtn) {
        exitFullscreenBtn.addEventListener("click", () => {
            if (fullscreenSlideshow) fullscreenSlideshow.classList.remove("active");
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        });
    }

    const printSlidesBtn = document.getElementById("printSlidesBtn");
    if (printSlidesBtn) {
        printSlidesBtn.addEventListener("click", () => {
            if (!isDeanAuthenticated) return;
            const printContainer = document.getElementById("printContainer");
            const approvedList = nominations.filter(n => n.status === "Approved");

            if (printContainer) {
                printContainer.innerHTML = "";
                approvedList.forEach(nom => {
                    const slide = document.createElement("div");
                    slide.className = "printable-slide slide-stage cardinal-dark";
                    slide.innerHTML = `
                        <div class="slide-top-bar">
                            <div class="slide-school-tag">East Central MS S.O.A.R. Certificate</div>
                            <div class="slide-pillar-badge">${nom.pillar} - ${nom.pillarName}</div>
                        </div>
                        <div class="slide-body">
                            <div class="slide-student-name">${nom.studentName}</div>
                            <div class="slide-grade-tag">${nom.grade} • Recognized in ${nom.location}</div>
                            <div class="slide-quote">"${nom.reason}"</div>
                        </div>
                        <div class="slide-footer">
                            <div>Nominated by: ${nom.nominatorName}</div>
                            <div>East Central Middle School Administration</div>
                        </div>
                    `;
                    printContainer.appendChild(slide);
                });
                window.print();
            }
        });
    }

    // PROTECTED PARENT MESSAGE CENTER
    const parentStudentList = document.getElementById("parentStudentList");
    const parentLangSelect = document.getElementById("parentLangSelect");
    const messageOutputContainer = document.getElementById("messageOutputContainer");

    function renderParentCenter() {
        if (!parentStudentList || !isDeanAuthenticated) return;

        const approvedList = nominations.filter(n => n.status === "Approved");
        parentStudentList.innerHTML = "";

        if (approvedList.length === 0) {
            parentStudentList.innerHTML = `<p style="font-size:0.85rem; color:#64748B;">No approved students available.</p>`;
            if (messageOutputContainer) messageOutputContainer.innerHTML = `<div class="placeholder-msg">Select an approved nomination to preview parent messages.</div>`;
            return;
        }

        if (!selectedParentNomId || !approvedList.some(n => n.id === selectedParentNomId)) {
            selectedParentNomId = approvedList[0].id;
        }

        approvedList.forEach(nom => {
            const item = document.createElement("div");
            item.className = `student-select-item ${nom.id === selectedParentNomId ? 'active' : ''}`;
            item.innerHTML = `
                <strong style="color:#0F172A">${nom.studentName}</strong> (${nom.grade})<br>
                <span style="font-size:0.8rem; color:#64748B">${nom.pillar} - ${nom.pillarName}</span>
            `;
            item.addEventListener("click", () => {
                selectedParentNomId = nom.id;
                renderParentCenter();
            });
            parentStudentList.appendChild(item);
        });

        generateParentMessage();
    }

    document.querySelectorAll(".format-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".format-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentParentFormat = btn.getAttribute("data-format");
            generateParentMessage();
        });
    });

    if (parentLangSelect) parentLangSelect.addEventListener("change", generateParentMessage);

    function generateParentMessage() {
        if (!selectedParentNomId || !messageOutputContainer || !isDeanAuthenticated) return;
        const nom = nominations.find(n => n.id === selectedParentNomId);
        if (!nom) return;

        const lang = parentLangSelect ? parentLangSelect.value : "en";
        let text = "";

        if (lang === "es") {
            if (currentParentFormat === "email") {
                text = `Asunto: ¡Reconocimiento S.O.A.R. de East Central MS para ${nom.studentName}! 🌟\n\nEstimado/a padre, madre o tutor/a:\n\nNos complace informarle que ${nom.studentName} ha recibido una nominación especial S.O.A.R. en East Central Middle School por demostrar ${getSpanishPillar(nom.pillar)} en ${getSpanishLocation(nom.location)}.\n\nDetalles del reconocimiento:\n• Nominado/a por: ${nom.nominatorName}\n• Motivo: "${nom.reason}"\n\nEn East Central MS celebramos el trabajo duro, el respeto y la integridad de nuestros estudiantes. ¡Gracias por apoyar el éxito escolar de su hijo/a!\n\nAtentamente,\nEquipo Directivo y Decanos de East Central MS`;
            } else if (currentParentFormat === "sms") {
                text = `Hola de East Central MS: ¡Felicidades! ${nom.studentName} fue nominado/a hoy por demostrar S.O.A.R. (${getSpanishPillar(nom.pillar)}). Razón: "${nom.reason}". ¡Estamos muy orgullosos!`;
            } else {
                text = `CENTRO DE ENSEÑANZA MEDIA EAST CENTRAL MS\nCARTA OFICIAL DE RECONOCIMIENTO S.O.A.R.\n\nPara los tutores de: ${nom.studentName}\nGrado: ${nom.grade}\n\nPor la presente certificamos que ${nom.studentName} ha sido destacado/a por su ejemplar comportamiento en ${getSpanishLocation(nom.location)}, guiado/a por los valores S.O.A.R. (${getSpanishPillar(nom.pillar)}).\n\nReconocimiento de la facultad:\n"${nom.reason}"\n\nFirma del Decano: _______________________    Fecha: ${nom.date}`;
            }
        } else {
            if (currentParentFormat === "email") {
                text = `Subject: East Central MS S.O.A.R. Recognition for ${nom.studentName}! 🌟\n\nDear Parent/Guardian,\n\nWe are excited to share that ${nom.studentName} received a special S.O.A.R. Recognition today at East Central Middle School for demonstrating ${nom.pillarName} in the ${nom.location}.\n\nNomination Details:\n• Nominated by: ${nom.nominatorName}\n• Specific Reason: "${nom.reason}"\n\nAt East Central MS, we celebrate students who Show respect, Own their learning, Act with integrity, and Rise above conflict. Thank you for your continued partnership and support!\n\nWarm regards,\nEast Central MS Administration & Deans`;
            } else if (currentParentFormat === "sms") {
                text = `East Central MS Alert: Congratulations! ${nom.studentName} received a S.O.A.R. Recognition today for demonstrating ${nom.pillarName}! Reason: "${nom.reason}". We are so proud!`;
            } else {
                text = `EAST CENTRAL MIDDLE SCHOOL\nOFFICIAL S.O.A.R. RECOGNITION COMMENDATION\n\nTo the Parent/Guardian of: ${nom.studentName}\nGrade Level: ${nom.grade}\n\nThis letter formally recognizes ${nom.studentName} for outstanding positive behavior in the ${nom.location}, upholding our S.O.A.R. pillar of ${nom.pillarName}.\n\nStaff Commendation:\n"${nom.reason}"\n\nDean/Administrator Signature: _______________________   Date: ${nom.date}`;
            }
        }

        messageOutputContainer.textContent = text;
    }

    function getSpanishPillar(code) {
        switch(code) {
            case "S": return "Mostrar Respeto (Show Respect)";
            case "O": return "Asumir Responsabilidad (Own Learning)";
            case "A": return "Actuar con Integridad (Act with Integrity)";
            case "R": return "Superar Conflictos (Rise Above Conflict)";
            default: return "Expectativa S.O.A.R.";
        }
    }

    function getSpanishLocation(loc) {
        const map = {
            Classroom: "el Salón de Clases",
            Hallway: "el Pasillo",
            Cafeteria: "la Cafetería",
            Bathroom: "el Baño",
            Office: "la Oficina",
            Stairwell: "las Escaleras",
            Assemblies: "las Asambleas",
            Technology: "el uso de Tecnología"
        };
        return map[loc] || loc;
    }

    const copyMessageBtn = document.getElementById("copyMessageBtn");
    if (copyMessageBtn) {
        copyMessageBtn.addEventListener("click", () => {
            if (!isDeanAuthenticated || !messageOutputContainer) return;
            navigator.clipboard.writeText(messageOutputContainer.textContent);
            alert("Copied parent message to clipboard!");
        });
    }

    const printLetterBtn = document.getElementById("printLetterBtn");
    if (printLetterBtn) {
        printLetterBtn.addEventListener("click", () => {
            if (!isDeanAuthenticated || !messageOutputContainer) return;
            const printContainer = document.getElementById("printContainer");
            if (printContainer) {
                printContainer.innerHTML = `<pre style="font-family: inherit; font-size: 1rem; padding: 2rem;">${messageOutputContainer.textContent}</pre>`;
                window.print();
            }
        });
    }

    // PROTECTED ANALYTICS & DEAN EQUITY DASHBOARD
    function renderAnalytics() {
        if (!isDeanAuthenticated) return;

        const total = nominations.length;
        const approved = nominations.filter(n => n.status === "Approved").length;
        const uniqueStudents = new Set(nominations.map(n => n.studentName.toLowerCase().trim())).size;
        const approvalRate = total ? Math.round((approved / total) * 100) : 0;

        const kpiTotal = document.getElementById("kpiTotal");
        const kpiApproved = document.getElementById("kpiApproved");
        const kpiApprovalRate = document.getElementById("kpiApprovalRate");
        const kpiUniqueStudents = document.getElementById("kpiUniqueStudents");

        if (kpiTotal) kpiTotal.textContent = total;
        if (kpiApproved) kpiApproved.textContent = approved;
        if (kpiApprovalRate) kpiApprovalRate.textContent = `${approvalRate}%`;
        if (kpiUniqueStudents) kpiUniqueStudents.textContent = uniqueStudents;

        const staffCounts = {};
        nominations.forEach(n => {
            if (n.nominatorName && n.nominatorRole.includes("Teacher")) {
                staffCounts[n.nominatorName] = (staffCounts[n.nominatorName] || 0) + 1;
            }
        });

        const staffLeaderboard = document.getElementById("staffLeaderboard");
        if (staffLeaderboard) {
            staffLeaderboard.innerHTML = "";
            const sortedStaff = Object.entries(staffCounts).sort((a, b) => b[1] - a[1]);
            const maxStaffVal = sortedStaff.length > 0 ? sortedStaff[0][1] : 1;

            if (sortedStaff.length === 0) {
                staffLeaderboard.innerHTML = `<p style="font-size:0.85rem; color:#64748B;">No teacher nominations logged yet.</p>`;
            } else {
                sortedStaff.slice(0, 5).forEach(([name, count]) => {
                    const pct = (count / maxStaffVal) * 100;
                    const row = document.createElement("div");
                    row.className = "bar-row";
                    row.innerHTML = `
                        <div class="bar-label" style="width:160px; font-size:0.8rem;">🍎 ${name}</div>
                        <div class="bar-track">
                            <div class="bar-fill" style="width:${pct}%; background:#FFB703;"></div>
                        </div>
                        <div class="bar-val">${count}</div>
                    `;
                    staffLeaderboard.appendChild(row);
                });
            }
        }

        const pillarCounts = { S: 0, O: 0, A: 0, R: 0 };
        nominations.forEach(n => { if (pillarCounts[n.pillar] !== undefined) pillarCounts[n.pillar]++; });

        const pillarBarChart = document.getElementById("pillarBarChart");
        if (pillarBarChart) {
            pillarBarChart.innerHTML = "";
            const maxVal = Math.max(...Object.values(pillarCounts), 1);

            [
                { code: "S", label: "S - Show Respect", count: pillarCounts.S, color: "#DC143C" },
                { code: "O", label: "O - Own Learning", count: pillarCounts.O, color: "#FFB703" },
                { code: "A", label: "A - Act Integrity", count: pillarCounts.A, color: "#2A9D8F" },
                { code: "R", label: "R - Rise Conflict", count: pillarCounts.R, color: "#457B9D" }
            ].forEach(item => {
                const pct = (item.count / maxVal) * 100;
                const row = document.createElement("div");
                row.className = "bar-row";
                row.innerHTML = `
                    <div class="bar-label">${item.label}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width:${pct}%; background:${item.color};"></div>
                    </div>
                    <div class="bar-val">${item.count}</div>
                `;
                pillarBarChart.appendChild(row);
            });
        }
    }

    // Matrix Table Renderer
    function renderMatrixTable() {
        const table = document.getElementById("soarMatrixTable");
        if (!table) return;

        const data = SOAR_MATRIX[currentLang] || SOAR_MATRIX.en;
        const matrixTitle = document.getElementById("matrixTitle");
        const matrixSubtitle = document.getElementById("matrixSubtitle");

        if (matrixTitle) matrixTitle.textContent = data.title;
        if (matrixSubtitle) matrixSubtitle.textContent = data.subtitle;

        let html = `
            <thead>
                <tr>
                    <th style="width: 220px;">S.O.A.R. Expectations</th>
                    ${data.locations.map(loc => `<th>${loc}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
        `;

        data.pillars.forEach(p => {
            html += `
                <tr>
                    <td class="pillar-col-header" style="background:${p.color};">
                        <strong>${p.name}</strong>
                    </td>
            `;

            data.locations.map(loc => {
                const items = p.items[loc] || [];
                html += `
                    <td>
                        <ul style="padding-left:1rem; margin:0;">
                            ${items.map(i => `<li style="margin-bottom:0.3rem;">${i}</li>`).join('')}
                        </ul>
                    </td>
                `;
            });

            html += `</tr>`;
        });

        html += `</tbody>`;
        table.innerHTML = html;
    }

    // Language Toggle
    const langToggleBtn = document.getElementById("langToggleBtn");
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            currentLang = currentLang === "en" ? "es" : "en";
            const currentLangLabel = document.getElementById("currentLangLabel");
            if (currentLangLabel) currentLangLabel.textContent = currentLang === "en" ? "English" : "Español";
            renderMatrixTable();
            renderInteractiveLocationMatrix(selectedLocation);
            renderQuickSkillChips();
        });
    }

    const matrixLangBtn = document.getElementById("matrixLangBtn");
    if (matrixLangBtn) matrixLangBtn.addEventListener("click", () => langToggleBtn && langToggleBtn.click());

    renderMatrixTable();

    // CLOUD SYNC & DATA RECOVERY ENGINE
    const cloudSyncModal = document.getElementById("cloudSyncModal");
    const cloudSyncBtn = document.getElementById("cloudSyncBtn");
    const importJsonBtn = document.getElementById("importJsonBtn");
    const closeCloudSyncModalBtn = document.getElementById("closeCloudSyncModalBtn");
    const closeCloudSyncFooterBtn = document.getElementById("closeCloudSyncFooterBtn");
    const cloudWebhookUrlInput = document.getElementById("cloudWebhookUrlInput");
    const saveCloudSyncBtn = document.getElementById("saveCloudSyncBtn");
    const executeJsonImportBtn = document.getElementById("executeJsonImportBtn");
    const importJsonFileInput = document.getElementById("importJsonFileInput");
    const importJsonTextInput = document.getElementById("importJsonTextInput");
    const exportDeviceNominationsBtn = document.getElementById("exportDeviceNominationsBtn");

    const openMasterSheetBtn = document.getElementById("openMasterSheetBtn");
    const masterSheetUrlInput = document.getElementById("masterSheetUrlInput");

    const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyH3f4BuvVC_0Ynd_j9HVjlsmn5Dw1nY_OhYcPYcZLtJrKQO1uDAzQaCrXzWMNmkuo1SA/exec";
    const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1jMWKIKLflSM6iopSMgHgjLHEzeOXpgnyg-lWh1cbsmg/edit?usp=sharing";

    let cloudWebhookUrl = localStorage.getItem("ecms_soar_cloud_webhook") || DEFAULT_WEBHOOK_URL;
    let masterSheetUrl = localStorage.getItem("ecms_soar_sheet_url") || DEFAULT_SHEET_URL;

    if (cloudWebhookUrlInput) cloudWebhookUrlInput.value = cloudWebhookUrl;
    if (masterSheetUrlInput) masterSheetUrlInput.value = masterSheetUrl;
    if (openMasterSheetBtn) openMasterSheetBtn.href = masterSheetUrl;

    function openCloudSyncModal() {
        if (cloudSyncModal) cloudSyncModal.classList.add("open");
    }
    function closeCloudSyncModal() {
        if (cloudSyncModal) cloudSyncModal.classList.remove("open");
    }

    if (cloudSyncBtn) cloudSyncBtn.addEventListener("click", openCloudSyncModal);
    if (importJsonBtn) importJsonBtn.addEventListener("click", openCloudSyncModal);
    if (closeCloudSyncModalBtn) closeCloudSyncModalBtn.addEventListener("click", closeCloudSyncModal);
    if (closeCloudSyncFooterBtn) closeCloudSyncFooterBtn.addEventListener("click", closeCloudSyncModal);

    if (saveCloudSyncBtn) {
        saveCloudSyncBtn.addEventListener("click", () => {
            const url = cloudWebhookUrlInput.value.trim() || DEFAULT_WEBHOOK_URL;
            const sheetUrl = (masterSheetUrlInput && masterSheetUrlInput.value.trim()) || DEFAULT_SHEET_URL;
            cloudWebhookUrl = url;
            masterSheetUrl = sheetUrl;
            localStorage.setItem("ecms_soar_cloud_webhook", url);
            localStorage.setItem("ecms_soar_sheet_url", sheetUrl);
            if (openMasterSheetBtn) openMasterSheetBtn.href = masterSheetUrl;
            alert("✅ Cloud Webhook and Master Spreadsheet links saved successfully!");
            if (url) fetchRemoteCloudNominations();
        });
    }

    // OFFLINE OUTBOX QUEUE & AUTO-RETRY SYNC ENGINE
    let pendingOutbox = JSON.parse(localStorage.getItem("ecms_soar_outbox_queue")) || [];

    function saveOutboxQueue() {
        localStorage.setItem("ecms_soar_outbox_queue", JSON.stringify(pendingOutbox));
    }

    function syncNominationToCloud(nominationObj) {
        if (!cloudWebhookUrl) return;
        if (!pendingOutbox.some(item => item.id === nominationObj.id)) {
            pendingOutbox.push(nominationObj);
            saveOutboxQueue();
        }
        processOutboxQueue();
    }

    function processOutboxQueue() {
        if (!cloudWebhookUrl || pendingOutbox.length === 0) return;

        const itemToSync = pendingOutbox[0];
        fetch(cloudWebhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(itemToSync)
        }).then(() => {
            pendingOutbox.shift();
            saveOutboxQueue();
            if (pendingOutbox.length > 0) {
                setTimeout(processOutboxQueue, 500);
            }
        }).catch(err => {
            console.log("Wi-Fi offline or sync pending; will retry automatically when reconnected.");
        });
    }

    function fetchRemoteCloudNominations() {
        if (!cloudWebhookUrl) return;
        fetch(cloudWebhookUrl)
            .then(res => res.json())
            .then(remoteItems => {
                const items = Array.isArray(remoteItems) ? remoteItems : (remoteItems.data || remoteItems.nominations || []);
                if (Array.isArray(items) && items.length > 0) {
                    mergeNominationsList(items);
                }
            }).catch(e => console.log("Cloud fetch note:", e));
    }

    window.addEventListener("online", () => {
        processOutboxQueue();
        fetchRemoteCloudNominations();
    });

    // Auto-poll cloud backend every 30 seconds on active Dean sessions
    setInterval(() => {
        if (isDeanAuthenticated && cloudWebhookUrl) {
            fetchRemoteCloudNominations();
        }
        processOutboxQueue();
    }, 30000);

    function mergeNominationsList(newItems) {
        let addedCount = 0;
        newItems.forEach(item => {
            if (!item.id) return;
            if (item.type === "reward_idea" || item.id.startsWith("idea-")) {
                const exists = rewardIdeas.some(r => r.id === item.id || (r.title === item.title && r.studentName === item.studentName));
                if (!exists) {
                    rewardIdeas.unshift(item);
                    addedCount++;
                } else {
                    const target = rewardIdeas.find(r => r.id === item.id);
                    if (target && target.status !== item.status) {
                        target.status = item.status;
                        addedCount++;
                    }
                }
            } else if (item.studentName) {
                const exists = nominations.some(n => n.id === item.id || (n.studentName === item.studentName && n.reason === item.reason));
                if (!exists) {
                    nominations.unshift(item);
                    addedCount++;
                }
            }
        });
        if (addedCount > 0) {
            saveState();
            renderModerationQueue();
            renderRewardIdeasQueue();
            renderApprovedRewardStore();
            renderSotmLeaderboard();
            renderSlideDeck();
            renderTicketsGrid();
        }
        return addedCount;
    }

    if (executeJsonImportBtn) {
        executeJsonImportBtn.addEventListener("click", () => {
            const jsonText = importJsonTextInput ? importJsonTextInput.value.trim() : "";
            const file = importJsonFileInput && importJsonFileInput.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const parsed = JSON.parse(e.target.result);
                        const items = Array.isArray(parsed) ? parsed : (parsed.nominations || [parsed]);
                        const added = mergeNominationsList(items);
                        alert(`🎉 Successfully imported and merged ${added} nominations from file!`);
                        if (importJsonTextInput) importJsonTextInput.value = "";
                        importJsonFileInput.value = "";
                        closeCloudSyncModal();
                    } catch(err) {
                        alert("❌ Invalid JSON file format. Please check your backup file.");
                    }
                };
                reader.readAsText(file);
            } else if (jsonText) {
                try {
                    const parsed = JSON.parse(jsonText);
                    const items = Array.isArray(parsed) ? parsed : (parsed.nominations || [parsed]);
                    const added = mergeNominationsList(items);
                    alert(`🎉 Successfully imported and merged ${added} nominations!`);
                    if (importJsonTextInput) importJsonTextInput.value = "";
                    closeCloudSyncModal();
                } catch(err) {
                    alert("❌ Invalid JSON text format. Please paste valid nomination JSON.");
                }
            } else {
                alert("Please select a JSON file or paste JSON code to import.");
            }
        });
    }

    if (exportDeviceNominationsBtn) {
        exportDeviceNominationsBtn.addEventListener("click", () => {
            const jsonStr = JSON.stringify(nominations, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ECMS_Device_Nominations_${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (cloudWebhookUrl) fetchRemoteCloudNominations();
});
