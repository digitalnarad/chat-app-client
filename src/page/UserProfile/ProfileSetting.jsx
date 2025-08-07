import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import { useNavigate, useParams } from "react-router-dom";
function ProfileSetting() {
  const { tab } = useParams();
  const navigate = useNavigate();
  console.log("tab", tab);

  const [activeTab, setActiveTab] = useState(tab ? tab : "profile");

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);
  return (
    <div className="profile-setting-container">
      <div className="profile-setting">
        <div className="profile-setting-sidebar">
          <div className="profile-setting-sidebar-content">
            <div
              className={`profile-setting-sidebar-item ${
                activeTab === "profile"
                  ? "profile-setting-sidebar-item-active"
                  : ""
              } `}
              onClick={() => navigate("/profile-setting")}
            >
              <div className="profile-setting-sidebar-item-title">
                Profile Setting
              </div>
              <div className="profile-setting-sidebar-item-icon">👨🏻‍💼</div>
            </div>

            <div
              className={`profile-setting-sidebar-item ${
                activeTab === "gallery"
                  ? "profile-setting-sidebar-item-active"
                  : ""
              } `}
              onClick={() => navigate("/profile-setting/gallery")}
            >
              <div className="profile-setting-sidebar-item-title">
                Your Gallery
              </div>
              <div className="profile-setting-sidebar-item-icon">👨🏻</div>
            </div>

            <div className="profile-setting-sidebar-item" onClick={() => {}}>
              <div className="profile-setting-sidebar-item-title">Logout</div>
              <div className="profile-setting-sidebar-item-icon">❌</div>
            </div>
          </div>
        </div>
        <div className="profile-setting-content"></div>
      </div>
    </div>
  );
}

export default ProfileSetting;
