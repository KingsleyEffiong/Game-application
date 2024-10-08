function Profile({ userData }) {
    return (
      <div className="py-4 px-3">
        <div className="flex px-3 items-center">
          <i className="bi bi-person-circle text-yellow-400 text-normal mx-1 animate-scaleUp"></i>
          <div className="flex flex-col mx-3">
            <h3 className="text-yellow-400 text-sm animate-scaleUp">{userData.name.toLowerCase()}</h3>
            <h3 className="text-yellow-400 text-sm animate-scaleUp">{userData.id.toLowerCase()}</h3>
            <h3 className="text-yellow-400 text-sm animate-scaleUp">
              {/* {new Intl.NumberFormat('en-NG').format(userData.point)} points */}
            </h3>
          </div>
        </div>
      </div>
    );
  }

export default Profile