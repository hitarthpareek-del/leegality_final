import { useEffect, useMemo, useRef, useState } from "react";
import { Form, ListGroup, Spinner } from "react-bootstrap";
import { getMembers } from "../../services/memberService";
import useAuth from "../../context/useAuth";
import useCompany from "../../context/useCompany";

export default function MemberSearch({
  onSelect,
  placeholder = "Search member by name...",
}) {
  const { user } = useAuth();
  const { selectedCompany } = useCompany();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    loadMembers();
  }, [selectedCompany]);

  async function loadMembers() {
    try {
      setLoading(true);

      const response = await getMembers(
        user.token,
        selectedCompany
      );

      setMembers(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return [];

    return members.filter((member) =>
      member.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [members, search]);

  function handleSelect(member) {
    setSearch(member.full_name);
    setShowDropdown(false);

    if (onSelect) {
      onSelect(member);
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div
      className="position-relative mb-4"
      ref={wrapperRef}
    >
      <Form.Label className="fw-semibold">
        Search Member
      </Form.Label>

      <Form.Control
        placeholder={placeholder}
        value={search}
        onFocus={() => setShowDropdown(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
        }}
      />

      {loading && (
        <div className="mt-2">
          <Spinner size="sm" />
        </div>
      )}

      {showDropdown &&
        filteredMembers.length > 0 && (
          <ListGroup
            className="position-absolute w-100 shadow"
            style={{
              zIndex: 1000,
              maxHeight: 250,
              overflowY: "auto",
            }}
          >
            {filteredMembers.map((member) => (
              <ListGroup.Item
                action
                key={member.id}
                onClick={() =>
                  handleSelect(member)
                }
              >
                <div className="fw-semibold">
                  {member.full_name}
                </div>

                <small className="text-muted">
                  {member.email}
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>

        )}

      {showDropdown &&
        search &&
        !loading &&
        filteredMembers.length === 0 && (
          <ListGroup
            className="position-absolute w-100 shadow"
            style={{ zIndex: 1000 }}
          >
            <ListGroup.Item>
              No members found
            </ListGroup.Item>
          </ListGroup>
        )}
    </div>
  );
}